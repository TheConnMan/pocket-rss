docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
VERSION=`node -e "console.log(require('./package.json').version);"`;

if [ "$TRAVIS_BRANCH" == "dev" ]; then
  sed -i "s/$VERSION/$VERSION-dev/g" package.json;
elif [ "$TRAVIS_BRANCH" != "master" ] && [ "$TRAVIS_BRANCH" != "dev" ]; then
  sed -i "s/$VERSION/$VERSION-${TRAVIS_BRANCH#*/}/g" package.json;
fi

docker build -t theconnman/pocket-rss .;

if [ "$TRAVIS_BRANCH" == "master" ]; then
  docker tag theconnman/pocket-rss theconnman/pocket-rss:$VERSION;
  docker push theconnman/pocket-rss:latest;
  docker push theconnman/pocket-rss:$VERSION;
elif [ "$TRAVIS_BRANCH" == "dev" ]; then
  docker tag theconnman/pocket-rss theconnman/pocket-rss:latest-dev;
  docker push theconnman/pocket-rss:latest-dev;
else
  docker tag theconnman/pocket-rss theconnman/pocket-rss:${TRAVIS_BRANCH#*/};
  docker push theconnman/pocket-rss:${TRAVIS_BRANCH#*/};
fi
