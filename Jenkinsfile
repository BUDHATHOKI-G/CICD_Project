pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = '462970f1-f907-43aa-8068-1f11efc6e031'
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

// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_CREDENTIALS = '462970f1-f907-43aa-8068-1f11efc6e031'
//         BACKEND_IMAGE = 'backend-app'
//         FRONTEND_IMAGE = 'frontend-app'
//         DOCKERHUB_USERNAME = 'ganeshbudhathoki'
//         VERSION = "1.0.${env.BUILD_NUMBER}"   // Auto version per build
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 git branch: 'main', url: 'https://github.com/BUDHATHOKI-G/CICD_Project.git'
//             }
//         }

//         stage('Build Backend Image') {
//             steps {
//                 sh """
//                   docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest \
//                                -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} ./backend
//                 """
//             }
//         }

//         stage('Build Frontend Image') {
//             steps {
//                 sh """
//                   docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest \
//                                -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} ./frontend
//                 """
//             }
//         }

//         stage('Push Images to Docker Hub') {
//             steps {
//                 withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", 
//                                                   usernameVariable: 'USERNAME', 
//                                                   passwordVariable: 'PASSWORD')]) {
//                     sh """
//                         echo $PASSWORD | docker login -u $USERNAME --password-stdin
//                         docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
//                         docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
//                         docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
//                         docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
//                     """
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 sh """
//                   kubectl rollout restart deployment/backend
//                   kubectl rollout restart deployment/frontend
//                   kubectl rollout status deployment/backend
//                   kubectl rollout status deployment/frontend
//                 """
//             }
//         }
//     }
// }
