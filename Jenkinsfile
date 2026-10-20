// CI/CD: test -> build -> push to ECR -> deploy to EC2.
// Images contain no secrets. The EC2 host pulls them from ECR and reads its config from AWS Secrets
// Manager itself (deploy/deploy.sh), using its IAM role, so no application secret passes through Jenkins.
//
// Jenkins setup (one time) — nothing environment-specific is stored in this repo:
//   Plugins:     Docker Pipeline, SSH Agent, AWS Credentials.
//   Agent tools: docker + compose plugin, aws CLI v2, openssh-client.
//   Credentials (Manage Jenkins > Credentials > Global):
//     github-token    Username with password      GitHub user + fine-grained PAT (used by the job's SCM config)
//     aws-ecr-push    AWS Credentials             access key ID / secret key of the Jenkins IAM user (ECR push only)
//     ec2-deploy-ssh  SSH Username with private key   user 'ubuntu' + the instance's .pem key
//     aws-account-id  Secret text                 12-digit AWS account ID
//     ec2-host        Secret text                 ubuntu@<ec2-public-dns-or-ip>
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        AWS_REGION     = 'ap-south-1'
        SECRET_ID      = 'prod/portfolio'
        REMOTE_DIR     = 'portfolio'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        EC2_HOST       = credentials('ec2-host')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Every build is tagged with its commit. A release is a git tag vMAJOR.MINOR.PATCH on that
                    // commit (git push origin v1.2.0); it adds that version as a second tag and is what gets deployed.
                    env.GIT_SHA = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
                    env.VERSION = sh(script: '''git tag --points-at HEAD --list 'v[0-9]*' --sort=-v:refname \
                                                 | grep -E '^v[0-9]+\\.[0-9]+\\.[0-9]+$' | head -n1 || true''',
                                     returnStdout: true).trim()
                    env.IMAGE_TAG = env.VERSION ?: env.GIT_SHA
                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.IMAGE_TAG}"
                }
                echo "Commit tag: ${env.GIT_SHA}, release version: ${env.VERSION ?: 'none'}, deploying: ${env.IMAGE_TAG}"
            }
        }

        stage('Validate compose files') {
            steps {
                // .env is gitignored; compose needs one to resolve env_file, so use the placeholder template.
                sh '[ -f .env ] || cp .env.example .env'
                sh 'docker compose config -q'
                sh '''
                    cp .env deploy/.env
                    ECR_REGISTRY=example.invalid docker compose -f deploy/docker-compose.prod.yml config -q
                    rc=$?
                    rm -f deploy/.env
                    exit $rc
                '''
            }
        }

        stage('Backend tests') {
            // Docker Pipeline shares this workspace with the Maven container (it handles Jenkins itself
            // running in Docker). Testcontainers starts Postgres as a sibling container via the host socket.
            agent {
                docker {
                    image 'maven:3.9-eclipse-temurin-17'
                    args '-v /var/run/docker.sock:/var/run/docker.sock ' +
                         '-v portfolio-m2:/root/.m2 ' +
                         '--add-host=host.docker.internal:host-gateway ' +
                         '-e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal'
                    reuseNode true
                }
            }
            steps {
                dir('backend') {
                    sh 'mvn -B test'
                }
            }
        }

        stage('Build images') {
            steps {
                // The frontend image build also type-checks (tsc -b).
                sh '''
                    ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                    docker build -t "$ECR_REGISTRY/portfolio/backend:$GIT_SHA"  backend
                    docker build -t "$ECR_REGISTRY/portfolio/frontend:$GIT_SHA" frontend
                '''
            }
        }

        stage('Push to ECR') {
            when { expression { env.GIT_BRANCH ==~ /(origin\/)?main/ } }
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-ecr-push',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh '''
                        ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                        aws ecr get-login-password --region "$AWS_REGION" \
                          | docker login --username AWS --password-stdin "$ECR_REGISTRY"

                        MEDIA_TYPES="application/vnd.docker.distribution.manifest.v2+json application/vnd.docker.distribution.manifest.list.v2+json application/vnd.oci.image.manifest.v1+json application/vnd.oci.image.index.v1+json"
                        # Prints "<digest> <mediaType>" for repo:tag, or nothing if the tag doesn't exist.
                        image_info() {
                          aws ecr batch-get-image --region "$AWS_REGION" --repository-name "$1" \
                            --image-ids imageTag="$2" --accepted-media-types $MEDIA_TYPES \
                            --query 'images[0].[imageId.imageDigest, imageManifestMediaType]' --output text \
                            | grep -v '^None' || true
                        }

                        # Repositories are created once in AWS with tag immutability on.
                        for repo in portfolio/backend portfolio/frontend; do
                          # 1. Commit tag. Rebuilding the same commit (e.g. to redeploy after a secret change)
                          #    reuses the image already pushed.
                          if [ -n "$(image_info "$repo" "$GIT_SHA")" ]; then
                            echo "$repo:$GIT_SHA already in ECR, skipping push"
                          else
                            docker push "$ECR_REGISTRY/$repo:$GIT_SHA"
                          fi

                          # 2. Release version: added inside ECR to the exact image of the commit tag, so
                          #    v1.2.0 and its commit tag are always the same image.
                          [ -n "$VERSION" ] || continue
                          sha_digest=$(image_info "$repo" "$GIT_SHA" | cut -f1)
                          version_digest=$(image_info "$repo" "$VERSION" | cut -f1)
                          if [ -z "$version_digest" ]; then
                            media_type=$(image_info "$repo" "$GIT_SHA" | cut -f2)
                            aws ecr batch-get-image --region "$AWS_REGION" --repository-name "$repo" \
                              --image-ids imageTag="$GIT_SHA" --accepted-media-types $MEDIA_TYPES \
                              --query 'images[0].imageManifest' --output text > manifest.json
                            aws ecr put-image --region "$AWS_REGION" --repository-name "$repo" \
                              --image-tag "$VERSION" --image-manifest file://manifest.json \
                              --image-manifest-media-type "$media_type" >/dev/null
                            rm -f manifest.json
                            echo "$repo:$VERSION -> $GIT_SHA"
                          elif [ "$version_digest" = "$sha_digest" ]; then
                            echo "$repo:$VERSION already points to $GIT_SHA"
                          else
                            echo "ERROR: $repo:$VERSION already exists in ECR for a different image." >&2
                            echo "Versions are immutable; tag this commit with a new version (e.g. bump the patch)." >&2
                            exit 1
                          fi
                        done
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            when { expression { env.GIT_BRANCH ==~ /(origin\/)?main/ } }
            steps {
                sshagent(credentials: ['ec2-deploy-ssh']) {
                    sh '''
                        ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                        SSH_OPTS="-o StrictHostKeyChecking=accept-new"
                        ssh $SSH_OPTS "$EC2_HOST" "mkdir -p $REMOTE_DIR"
                        scp $SSH_OPTS deploy/docker-compose.prod.yml deploy/deploy.sh deploy/fetch-env.sh "$EC2_HOST:$REMOTE_DIR/"
                        ssh $SSH_OPTS "$EC2_HOST" \
                          "chmod +x $REMOTE_DIR/*.sh && AWS_REGION=$AWS_REGION $REMOTE_DIR/deploy.sh $ECR_REGISTRY $IMAGE_TAG $SECRET_ID"
                    '''
                }
            }
        }

        stage('Smoke test') {
            when { expression { env.GIT_BRANCH ==~ /(origin\/)?main/ } }
            steps {
                sshagent(credentials: ['ec2-deploy-ssh']) {
                    // Hits Nginx on the host, which proxies /api to the backend.
                    sh '''
                        ssh -o StrictHostKeyChecking=accept-new "$EC2_HOST" '
                          port=$(grep -E "^FRONTEND_PORT=" '"$REMOTE_DIR"'/.env | cut -d= -f2 | tr -d "\\047"); port=${port:-80}
                          curl -fsS "http://localhost:$port/healthz" >/dev/null &&
                          curl -fsS "http://localhost:$port/api/v1/portfolio" >/dev/null &&
                          echo "Smoke test passed"'
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                // GIT_SHA is only set once Checkout ran; if the build failed earlier (e.g. a missing
                // credential in the environment block) there is no workspace and nothing to clean up.
                if (env.GIT_SHA) {
                    // Don't let tagged images pile up on the build agent.
                    sh '''
                        ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                        docker image rm "$ECR_REGISTRY/portfolio/backend:$GIT_SHA" "$ECR_REGISTRY/portfolio/frontend:$GIT_SHA" >/dev/null 2>&1 || true
                    '''
                }
            }
        }
        failure {
            // Plain text: environment variables may be unset if the build failed before any stage ran.
            echo 'Build failed. If a deploy broke the site, roll back on EC2: ~/portfolio/deploy.sh <account-id>.dkr.ecr.ap-south-1.amazonaws.com <previous tag from ~/portfolio/deployed-tags.log> prod/portfolio'
        }
    }
}
