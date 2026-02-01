


// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_USERNAME = 'ganeshbudhathoki'
//         BACKEND_IMAGE  = 'backend-app'
//         FRONTEND_IMAGE = 'frontend-app'
//         VERSION = "1.0.${BUILD_NUMBER}"
//     }

//     stages {

//         stage('Build Backend Image') {
//             steps {
//                 sh """
//                   docker build \
//                     -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
//                     backend
//                 """
//             }
//         }

//         stage('Build Frontend Image') {
//             steps {
//                 sh """
//                   docker build \
//                     -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
//                     frontend
//                 """
//             }
//         }

//         stage('Push Images to Docker Hub') {
//             steps {
//                 withCredentials([
//                     usernamePassword(
//                         credentialsId: '462970f1-f907-43aa-8068-1f11efc6e031',
//                         usernameVariable: 'DOCKER_USER',
//                         passwordVariable: 'DOCKER_PASS'
//                     )
//                 ]) {
//                     sh """
//                       echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

//                       docker tag ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
//                                  ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
//                       docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
//                       docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest

//                       docker tag ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
//                                  ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
//                       docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
//                       docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
//                     """
//                 }
//             }
//         }
//     }
// }


pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'ganeshbudhothoki'
        BACKEND_IMAGE  = 'backend-app'
        FRONTEND_IMAGE = 'frontend-app'
        VERSION = "1.0.${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                  docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                  docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} frontend
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    string(credentialsId: 'docker-hub-token', variable: 'DOCKER_PASS')
                ]) {
                    sh """
                      echo \$DOCKER_PASS | docker login -u ${DOCKERHUB_USERNAME} --password-stdin

                      # Backend
                      docker tag ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
                                 ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest

                      # Frontend
                      docker tag ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
                                 ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Docker images pushed successfully: ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} and ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}"
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}
