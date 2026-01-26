pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "ganeshbudhathoki"
        IMAGE_VERSION = "1.0.0"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USERNAME/backend-app:$IMAGE_VERSION ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USERNAME/frontend-app:$IMAGE_VERSION ./frontend'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
                    sh '''
                      echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin
                      docker push $DOCKERHUB_USERNAME/backend-app:$IMAGE_VERSION
                      docker push $DOCKERHUB_USERNAME/frontend-app:$IMAGE_VERSION
                    '''
                }
            }
        }
    }
}
