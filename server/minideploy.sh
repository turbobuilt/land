npx etsc
rsync -az build app@noisedestroyer.com:/home/app/server/
ssh app@noisedestroyer.com 'cd /home/app/server && /home/app/node/bin/npm install --production && pm2 restart all'