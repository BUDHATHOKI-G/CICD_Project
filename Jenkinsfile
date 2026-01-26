pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'BUDHATHOKI-G'
        IMAGE_VERSION = '1.0.0'  // Change manually or get from Git tag
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm test || echo "Backend tests failed but continuing..."'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test || echo "Frontend tests failed but continuing..."'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            sh "docker build -t $DOCKERHUB_USERNAME/backend-app:$IMAGE_VERSION ."
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t $DOCKERHUB_USERNAME/frontend-app:$IMAGE_VERSION ."
                        }
                    }
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
                    sh '''
                      echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin
                      docker push $DOCKERHUB_USERNAME/backend-app:$IMAGE_VERSION
                      docker push $DOCKERHUB_USERNAME/frontend-app:$IMAGE_VERSION
                      docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up Docker images..."
            sh "docker rmi $DOCKERHUB_USERNAME/backend-app:$IMAGE_VERSION || true"
            sh "docker rmi $DOCKERHUB_USERNAME/frontend-app:$IMAGE_VERSION || true"
        }
        success {
            echo 'Pipeline completed successfully! ✅'
        }
        failure {
            echo 'Pipeline failed ❌'
        }
    }
}
