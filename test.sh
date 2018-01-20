TOOL_LIST="TRAVIS-CI COVERALL CODECLIMATE DAVID-DM"

TRAVIS_REPO_SLUG="Elgismarus/game-on"
TRAVIS_BRANCH="build"
CODECLIMATE_API_AUTH="872ca126a50f3595e67beaa4837f85f6fb2ad5ed"

gist_bash_path="https://gist.githubusercontent.com/Elgismarus/5401dc3d9c630bcd73ec47a1c3430ccb/raw/6081eff0ba4dba3dc3af335bba310b700ed5b52c/update_badge.sh"
#source <(curl -s -L $gist_bash_path)
#GIST_BADGE_UPDATE_SCRIPT

echo "wtf"
read -a TOOL_LIST <<<$TOOL_LIST

for varname in ${TOOL_LIST[@]}
	do
		echo "Verifying ${varname}"		
done
