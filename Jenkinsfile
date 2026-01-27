pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'BUDHATHOKI-G'
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/backend-app"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend-app"
        VERSION = "1.0.${BUILD_NUMBER}"
    }

    stages {

        stage('Build Backend Image') {
            steps {
                sh "docker build -t $BACKEND_IMAGE:$VERSION ./backend"
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -t $FRONTEND_IMAGE:$VERSION ./frontend"
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                }
            }
        }

        stage('Push Images') {
            steps {
                sh "docker push $BACKEND_IMAGE:$VERSION"
                sh "docker push $FRONTEND_IMAGE:$VERSION"
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed"
        }
        success {
            echo "Pipeline completed successfully!"
        }
    }
}
