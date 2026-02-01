


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
        BACKEND_VERSION = "1.0.${BUILD_NUMBER}"
        FRONTEND_VERSION = "1.0.${BUILD_NUMBER}"
        DOCKER_REGISTRY = "ganeshbudhothoki"
        GIT_REPO = "https://github.com/BUDHATHOKI-G/CICD_Project.git"
        K8S_DIR = "k8s"
    }

    stages {

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '462970f1-f907-43aa-8068-1f11efc6e031',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                sh """
                docker build -t ${DOCKER_REGISTRY}/backend-app:${BACKEND_VERSION} ./backend
                docker push ${DOCKER_REGISTRY}/backend-app:${BACKEND_VERSION}
                """
            }
        }

        stage('Build & Push Frontend') {
            steps {
                sh """
                docker build -t ${DOCKER_REGISTRY}/frontend-app:${FRONTEND_VERSION} ./frontend
                docker push ${DOCKER_REGISTRY}/frontend-app:${FRONTEND_VERSION}
                """
            }
        }

        stage('Update k8s YAMLs') {
            steps {
                sh """
                # Update backend image
                sed -i 's|image: ${DOCKER_REGISTRY}/backend-app:.*|image: ${DOCKER_REGISTRY}/backend-app:${BACKEND_VERSION}|' ${K8S_DIR}/backend-deployment.yaml

                # Update frontend image
                sed -i 's|image: ${DOCKER_REGISTRY}/frontend-app:.*|image: ${DOCKER_REGISTRY}/frontend-app:${FRONTEND_VERSION}|' ${K8S_DIR}/frontend-deployment.yaml
                """
            }
        }

        stage('Push updated YAMLs to Git') {
            steps {
                sh """
                git config user.email "jenkins@ci.com"
                git config user.name "Jenkins CI"
                git add ${K8S_DIR}/backend-deployment.yaml ${K8S_DIR}/frontend-deployment.yaml
                git commit -m "Update backend/frontend image to ${BACKEND_VERSION}"
                git push ${GIT_REPO} main
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
