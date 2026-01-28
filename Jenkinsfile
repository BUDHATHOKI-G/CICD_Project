pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = '462970f1-f907-43aa-8068-1f11efc6e031'
        DOCKERHUB_USERNAME   = 'ganeshbudhathoki'

        BACKEND_IMAGE  = 'backend-app'
        FRONTEND_IMAGE = 'frontend-app'

        VERSION = "1.0.${BUILD_NUMBER}"
    }

    stages {

        stage('Clean & Checkout') {
            steps {
                // FIX: remove broken workspace
                deleteDir()

                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/BUDHATHOKI-G/CICD_Project.git'
                    ]]
                ])
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                  docker build \
                    -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
                    -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest \
                    backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                  docker build \
                    -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
                    -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest \
                    frontend
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: DOCKERHUB_CREDENTIALS,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh """
                      echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest

                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
                      docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Update K8s Manifests (GitOps)') {
            steps {
                sh """
                  sed -i 's|image:.*backend-app:.*|image: ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}|' k8s/backend-deployment.yaml
                  sed -i 's|image:.*frontend-app:.*|image: ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}|' k8s/frontend-deployment.yaml

                  git config user.email "jenkins@ci.local"
                  git config user.name "jenkins"

                  git add k8s/
                  git commit -m "ci: update images to ${VERSION}" || echo "No changes to commit"
                  git push origin main
                """
            }
        }
    }
}
