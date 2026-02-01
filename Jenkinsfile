pipeline {
    agent any
    environment {
        BACKEND_IMAGE = "ganeshbudhothoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhothoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set Version') {
            steps {
                script {
                    // Automatically generate version: YYYYMMDD.HHMMSS
                    VERSION = new Date().format("yyyyMMdd.HHmmss")
                    env.VERSION = VERSION
                    echo "Building images with version: ${VERSION}"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                // Secure login using Jenkins credentials
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}", 
                                                  usernameVariable: 'DOCKER_USER', 
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build --pull --cache-from ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${VERSION} backend"
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build --pull --cache-from ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${VERSION} frontend"
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh "docker push ${BACKEND_IMAGE}:${VERSION}"
                sh "docker push ${FRONTEND_IMAGE}:${VERSION}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Update image tags in Kubernetes manifests
                    sh """
                    sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${VERSION}|' k8s/backend-deployment.yaml
                    sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${VERSION}|' k8s/frontend-deployment.yaml
                    """

                    // Apply Kubernetes manifests
                    sh "kubectl apply -f k8s/backend-deployment.yaml"
                    sh "kubectl apply -f k8s/frontend-deployment.yaml"
                }
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline finished."
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}
