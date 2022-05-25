# divekit-repo-editor

> Note: The following describes the target behavior of the version 1.0.0.
> The current status can be taken from the changelog.

The divekit-repo-editor is based on the evaluation-processor. The editor allows the subsequent adjustment of individual
files over a larger number of repositories.

The editor has two different functionalities, one is to adjust a file equally in all repositories and the other is to
adjust individual files in repositories based on the used domain.

## Setup & Run

1. Install NodeJs (version >= 12.0.0) which is required to run this tool. NodeJs can be acquired on the
   website [nodejs.org](https://nodejs.org/en/download/).

2. To use this tool you have to clone this repository to your local drive.

3. This tool uses several libraries in order to use the Gitlab API etc. Install these libraries by running the
   command ```npm install``` in the root folder of this project.

4.
    - Navigate to your [Profile](https://git.st.archi-lab.io/-/profile/personal_access_tokens) and generate an Access Token / API-Token in
      order to get access to the gitlab api
    - Copy the Access Token
    - Rename the file .env.example to .env
    - Open .env and replace *YOUR_API_TOKEN* with the token you copied.

5. Configure the application in the config *src/main/config/evaluationConfig.json*.

6. To run the application navigate into the root folder of this tool and run ```npm start```. The evaluation overview
   will now be printed in the console.

## Configuration

TODO

## Changelog

### 0.0.1

- initialize project based on the divekit-evaluation-processor
