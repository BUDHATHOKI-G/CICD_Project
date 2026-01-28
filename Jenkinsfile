

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

pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = '462970f1-f907-43aa-8068-1f11efc6e031'
        DOCKERHUB_USERNAME   = 'ganeshbudhathoki'
        BACKEND_IMAGE        = 'backend-app'
        FRONTEND_IMAGE       = 'frontend-app'
        VERSION              = "1.0.${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/BUDHATHOKI-G/CICD_Project.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                  docker build \
                    -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
                    -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest \
                    ./backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                  docker build \
                    -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
                    -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest \
                    ./frontend
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: DOCKERHUB_CREDENTIALS,
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {
                    sh """
                      echo \$PASSWORD | docker login -u \$USERNAME --password-stdin
                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                sh """
                  sed -i 's|backend-app:.*|backend-app:${VERSION}|g' k8s/backend-deployment.yaml
                  sed -i 's|frontend-app:.*|frontend-app:${VERSION}|g' k8s/frontend-deployment.yaml

                  git config user.email "jenkins@ci.local"
                  git config user.name "jenkins"

                  git add k8s/
                  git commit -m "Update images to ${VERSION}"
                  git push origin main
                """
            }
        }
    }
}
