# !/.travis/badge.sh

# Exit script on error
set -e

# Script to update the badge in README.md
update_badge(){

	printf "---------------------------- UPDATE BADGE ----------------------------"
	# Should only be here if different branch
	printf "Attempting to update badges in README.md from ${PWD} ..."

	# Get all the links
	GAMEON_FILE_LINKS=$(grep https README.md | sed 's/https/\nhttps/g' | grep ^https | sed 's/\(^https[^ <]*\)\(.*\)/\1/g' | grep branch= | tr -d '()[]' | sort -u)

	# Loop through the links
	for link in $GAMEON_FILE_LINKS
	do
		# Change branch link
		temp=$(sed "s/branch=\(.*\)/branch=$TRAVIS_BRANCH/g" <<< $link)
		printf "Changing link from ${link} to ${temp}"
		sed -i "s,${link},${temp},g" README.md
	done

	printf "Badges link updated!"
	printf "----------------------------------------------------------------------\n"
}

commit_and_push(){
	printf "-------------------------- COMMIT AND PUSH ---------------------------"
	printf "Commit and pushing ${FILES} from ${PWD} ..."
	MESSAGE=$(git log --format=%B -n 1 $TRAVIS_COMMIT)
	git add ${FILES}
	git commit -m "[ci skip] ${MESSAGE}"
	git remote add origin "https://${GITHUB_TOKEN}@github.com:${TRAVIS_REPO_SLUG}.git" > /dev/null 2>&1
	git push origin $TRAVIS_BRANCH 
	printf "Commit and push done!"
	printf "----------------------------------------------------------------------\n"
}


# Retrieve branch name from badge
GAMEON_FILE_BRANCH=$(awk -F'[()]' '{print $2}' README.md | awk -F'[=&]' '{print $2}')

# Compare branches
if [ "$GAMEON_FILE_BRANCH" == "$TRAVIS_BRANCH" ]; then
	printf "Same branch - Skipping badge update!"
	exit 0
else
	printf "Update require for README.md required."
	update_badge
	commit_and_push
	exit 0
fi