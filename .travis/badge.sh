# Script to update the badge in README.md
update_badge(){

	# Should only be here if different branch
	echo "Attempting to update badges in README.md..."

	# Get all the links
	GAMEON_FILE_LINKS=$(grep https ../README.md | sed 's/https/\nhttps/g' | grep ^https | sed 's/\(^https[^ <]*\)\(.*\)/\1/g' | grep branch= | tr -d '()[]' | sort -u)

	# Loop through the links
	for link in $GAMEON_FILE_LINKS
	do
		# Change branch link
		temp=$(sed "s/branch=\(.*\)/branch=$TRAVIS_BRANCH/g" <<< $link)
		sed -i "s,${link},${temp},g" ../README.md
	done

	echo "Badges link updated!"
	exit 0
}

upload_repo(){

	git clone git://${GITHUB_REPO}
	cd ${REPO}

}

push_and_commit(){
	
	MESSAGE=$(git log --format=%B -n 1 $TRAVIS_COMMIT)
	git add ${FILES}
	git commit -m "[ci skip]" ${MESSAGE}
	git remote add origin "https://${GITHUB_TOKEN}@${GITHUB_REPO}" > /dev/null 2>&1
	git push --quiet --set-upstream origin TRAVIS_BRANCH 

}

# Retrieve branch name from badge
GAMEON_FILE_BRANCH=$(awk -F'[()]' '{print $2}' ../README.md | awk -F'[=&]' '{print $2}')

# Compare branches
if [ "$GAMEON_FILE_BRANCH" == "$TRAVIS_BRANCH" ]; then
	echo "Same branch - Skipping badge update!"
	exit 0
else
	echo "Update require for README.md required."
	upload_repo
	update_badge
	push_and_commit
fi
