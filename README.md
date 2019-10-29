#安裝環境
下載 ubuntu 版本 nodejs
https://nodejs.org/download/release/v8.16.0/

##解壓縮
tar zxvf node-v8.16.0-linux-x64

##建立連結
ln -s node-v8.16.0-linux-x64/bin/node /usr/bin/node

##安裝套件
npm install sleep
npm install rticonnextdds-connector
npm install mqtt
npm install request