


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
        BACKEND_IMAGE     = 'backend-app'
        FRONTEND_IMAGE    = 'frontend-app'
        VERSION           = "1.0.${BUILD_NUMBER}"
        GIT_REPO          = 'https://github.com/BUDHATHOKI-G/CICD_Project.git'
        GIT_CREDENTIALS   = '462970f1-f907-43aa-8068-1f11efc6e031'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: "${GIT_REPO}",
                    credentialsId: "${GIT_CREDENTIALS}"
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
                    usernamePassword(
                        credentialsId: "${GIT_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        # Backend
                        docker tag ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
                        docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
                        docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest

                        # Frontend
                        docker tag ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                        docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
                        docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest

                        docker logout
                    """
                }
            }
        }

        stage('Update k8s YAMLs') {
            steps {
                sh """
                    sed -i 's|image: .*backend-app:.*|image: ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}|g' k8s/backend-deployment.yaml
                    sed -i 's|image: .*frontend-app:.*|image: ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}|g' k8s/frontend-deployment.yaml
                """
            }
        }

        stage('Push Updated YAMLs to Git') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${GIT_CREDENTIALS}",
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh """
                        git config user.email "jenkins@example.com"
                        git config user.name "Jenkins CI"
                        git add k8s/
                        git commit -m "ci: update k8s YAMLs with new image tags ${VERSION}" || echo "No changes to commit"
                        git push https://\$GIT_USER:\$GIT_PASS@github.com/BUDHATHOKI-G/CICD_Project.git main
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline succeeded! Backend & Frontend images pushed and k8s YAMLs updated."
        }
        failure {
            echo "❌ Pipeline failed. Check the logs for details."
        }
    }
}
