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
                script {
                    docker.build("${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}", './backend')
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}", './frontend')
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        docker.image("${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}").push()
                        docker.image("${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}").push()
                    }
                }
            }
        }
    }
}
