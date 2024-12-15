pipeline {
    agent any

    environment {
        // Define AWS and Chef paths or variables
        CHEF_HOME = '/home/jenkins/.chef'
        AWS_REGION = 'eu-west-2'
        EC2_USER = 'ec2-user'
        EC2_HOST = 'ec2-13-41-159-25.eu-west-2.compute.amazonaws.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    // Clone the Git repository containing the website
                    checkout scm
                }
            }
        }

        stage('Package Application') {
            steps {
                sh '''
                echo "Packaging application..."
                zip -r website.zip *
                '''
            }
        }

        stage('Upload Package to EC2') {
            steps {
                sshagent(['aws-ec2-key']) {
                    sh '''
                    echo "Uploading package to EC2 instance..."
                    scp -o StrictHostKeyChecking=no website.zip $EC2_USER@$EC2_HOST:/tmp
                    '''
                }
            }
        }

        stage('Deploy with Chef') {
            steps {
                sshagent(['aws-ec2-key']) {
                    sh '''
                    echo "Setting up Chef and deploying application..."
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "bash -s" <<'EOF'

                    # Install Chef if not present
                    if ! command -v chef-client &> /dev/null; then
                        echo "Installing Chef..."
                        curl -L https://omnitruck.chef.io/install.sh | sudo bash
                    fi
                    
                    # Create the required directory structure
                    mkdir -p /tmp/cookbooks/website/recipes || exit 1
                    echo "Cookbook directory created: /tmp/cookbooks/website/recipes"

                    # Create the Chef configuration file for local mode
                    echo "
                    chef_license 'accept'
                    cookbook_path ['/tmp/cookbooks']
                    node_name 'website-deployment'
                    " | sudo tee /etc/chef/client.rb || exit 1

                    # Create the Chef recipe
                    echo "
                    bash 'unzip_website' do
                        code <<-EOH
                        # Ensure the target directory exists
                        sudo mkdir -p /var/www/html || exit 1
                        
                        # Unzip the website.zip file to the target directory
                        sudo unzip -o /tmp/website.zip -d /var/www/html/ || exit 1
                        
                        # Ensure the correct user exists for chown; check for apache or nginx user
                        if id 'apache' &>/dev/null; then
                            sudo chown -R apache:apache /var/www/html/
                        elif id 'nginx' &>/dev/null; then
                            sudo chown -R nginx:nginx /var/www/html/
                        else
                            sudo chown -R ec2-user:ec2-user /var/www/html/
                        fi
                        EOH
                    end
                    " | sudo tee /tmp/cookbooks/website/recipes/default.rb || exit 1

                    # Log to verify cookbook existence
                    ls -la /tmp/cookbooks/website/recipes
                    echo "Running Chef client in local mode..."

                    # Run Chef client in local mode
                    sudo chef-client --local-mode --runlist 'recipe[website]' -c /etc/chef/client.rb || exit 1

                    'EOF'
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Deployment failed. Check logs for details.."
        }
    }
}
