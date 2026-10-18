pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'ls'
            }
        }
        stage('Validate compose file') {
            steps {
                sh 'docker compose config -q'
            }
        }
        stage('Build images') {
            steps {
                sh 'docker compose build'
            }
        }
    }
}
