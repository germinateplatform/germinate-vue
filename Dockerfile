FROM tomcat:8-jdk8

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

# Clone the Germinate server code and client code
RUN git clone https://github.com/sebastian-raubach/germinate-server.git /opt/germinate-server && \
    git clone https://github.com/sebastian-raubach/germinate-vue.git /opt/germinate-client

# Install node.js
RUN apt-get update && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs

# Build the client code
WORKDIR /opt/germinate-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=/api/" > .env
RUN apt-get install -y build-essential && \
    npm i && \
    npm run build && \
    mkdir /opt/germinate-server/web/dist/ && \
    cp -a /opt/germinate-client/dist/. /opt/germinate-server/web/dist/

# Download Gradle and build the server code
RUN wget https://services.gradle.org/distributions/gradle-6.0.1-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-6.0.1-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/germinate" > /opt/germinate-server/config.properties && \
    echo "project.name=ROOT" > /opt/germinate-server/gradle.properties && \
    /opt/gradle-6.0.1/bin/gradle p /opt/germinate-server war && \
    mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT && \
    cp /opt/germinate-server/ROOT.war /usr/local/tomcat/webapps/

WORKDIR /