# !/.travis/badge.sh

# Exit script on error
set -e

# Script to update the badge in README.md
update_badge(){

	echo "---------------------------- UPDATE BADGE ----------------------------"
	# Should only be here if different branch
	echo "Attempting to update badges in ${FILES} from ${PWD} ..."

	# Get all the links
	GAMEON_FILE_LINKS=$(grep https $FILES | sed 's/https/\nhttps/g' | grep ^https | sed 's/\(^https[^ <]*\)\(.*\)/\1/g' | grep branch= | tr -d '()[]' | sort -u)

	# Loop through the links
	for link in $GAMEON_FILE_LINKS
	do
		# Change branch link
		temp=$(sed "s/branch=\(.*\)/branch=$TRAVIS_BRANCH/g" <<< $link)
		echo "Changing link from ${link} to ${temp}"
		sed -i "s,${link},${temp},g" $FILES 
	done

	echo "Badges link updated!"
	echo "----------------------------------------------------------------------"
	echo
}

commit_and_push(){
	echo "-------------------------- COMMIT AND PUSH ---------------------------"
	echo "Commit and pushing ${FILES} from ${PWD} ..."
	MESSAGE=$(git log --format=%B -n 1 $TRAVIS_COMMIT)
	git add $FILES
	git branch
#	git commit -m "[ci skip] ${MESSAGE}"
#	git remote add origin "https://${GITHUB_TOKEN}@github.com:${TRAVIS_REPO_SLUG}.git" > /dev/null 2>&1
#	git push origin $TRAVIS_BRANCH 
	echo "Commit and push done!"
	echo "----------------------------------------------------------------------"
	echo
}


# Retrieve branch name from badge
GAMEON_FILE_BRANCH=$(awk -F'[()]' '{print $2}' README.md | awk -F'[=&]' '{print $2}')

# Compare branches
if [ "$GAMEON_FILE_BRANCH" == "$TRAVIS_BRANCH" ]; then
	echo "Same branch - Skipping badge update!"
	exit 0
else
	echo "Update require for ${FILES} required."
	update_badge
	commit_and_push
	exit 0
fi