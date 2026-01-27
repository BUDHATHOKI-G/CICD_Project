pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub'
        BACKEND_IMAGE = 'backend-app'
        FRONTEND_IMAGE = 'frontend-app'
        DOCKERHUB_USERNAME = 'ganeshbudhathoki'
        VERSION = '1.0.0'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/BUDHATHOKI-G/CICD_Project.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} ./backend"
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} ./frontend"
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", 
                                                  usernameVariable: 'USERNAME', 
                                                  passwordVariable: 'PASSWORD')]) {
                    sh """
                        echo $PASSWORD | docker login -u $USERNAME --password-stdin
                        docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
                        docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
                    """
                }
            }
        }
    }
}
