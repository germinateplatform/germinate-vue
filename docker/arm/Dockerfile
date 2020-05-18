FROM arm32v7/tomcat:8-jre8

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

COPY qemu-arm-static /usr/bin/qemu-arm-static

# Clone the Germinate server code and client code
RUN apt-get update && \
    apt-get install -y git && \
    git clone https://github.com/germinateplatform/germinate-server.git /opt/germinate-server && \
    git clone https://github.com/germinateplatform/germinate-vue.git /opt/germinate-client

# Install node.js
RUN apt-get update && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs

# Build the client code
WORKDIR /opt/germinate-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env
RUN apt-get install -y build-essential && \
    rm -f package-lock.json && \
    npm i && \
    npm run build && \
    mkdir /opt/germinate-server/client/ && \
    cp -a /opt/germinate-client/dist/. /opt/germinate-server/client/

# Download Gradle and build the server code
RUN apt-get update && \
    apt-get install -y wget openjdk-8-jdk && \
    wget https://services.gradle.org/distributions/gradle-6.0.1-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-6.0.1-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/germinate" > /opt/germinate-server/config.properties && \
    echo "project.name=germinate" >> /opt/germinate-server/gradle.properties && \
    echo "org.gradle.jvmargs=-Xmx1536m -Xms512m -XX:+HeapDumpOnOutOfMemoryError" >> /opt/germinate-server/gradle.properties && \
    gradle --no-daemon --no-rebuild --max-workers=1 -p /opt/germinate-server war && \
    mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT && \
    cp /opt/germinate-server/build/libs/germinate-4.0.0.war /usr/local/tomcat/webapps/ROOT.war

RUN rm -rf /opt/germinate-server/ && \
    rm -rf /opt/germinate-client/ && \
    apt-get purge -y nodejs git && \
    apt-get autoremove -y

WORKDIR /