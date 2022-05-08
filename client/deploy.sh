LOGIN=root@TEST
if [[ $1 == 'prod' ]]; then
    LOGIN=root@137.184.64.102
fi
echo "deploying to $LOGIN"
npx vite build --base=/webapp
rsync -az --chown www-data:www-data dist/ $LOGIN:/var/www/html/webapp
# rsync -az --chown www-data:www-data .well-known root@TEST:/var/www/html

# npx vite build
# LOGIN=app@137.184.64.102
# rsync -az dist/ $LOGIN:/home/app/server/public