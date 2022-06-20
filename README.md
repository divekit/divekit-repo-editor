# divekit-repo-editor

The divekit-repo-editor allows the subsequent adjustment of individual files over a larger number of repositories.

The editor has two different functionalities, one is to adjust a file equally in all repositories and the other is to
adjust individual files in repositories based on the project name.

## Setup & Run

1. Install NodeJs (version >= 12.0.0) which is required to run this tool. NodeJs can be acquired on the
   website [nodejs.org](https://nodejs.org/en/download/).

2. To use this tool you have to clone this repository to your local drive.

3. This tool uses several libraries in order to use the Gitlab API etc. Install these libraries by running the
   command ```npm install``` in the root folder of this project.

4.
   - Navigate to your [Profile](https://git.st.archi-lab.io/-/profile/personal_access_tokens) and generate an Access
     Token / API-Token in order to get access to the gitlab api
   - Copy the Access Token
   - Rename the file .env.example to .env
   - Open .env and replace *YOUR_API_TOKEN* with the token you copied.

5. Configure the application via `src/main/config/` and add files to `assets/`, see below for more details.

6. To run the application navigate into the root folder of this tool and run ```npm start```. All assets will be
   updated.

## Configuration

Place all files that should be edited in the corresponding directories:

```
assets
├── PROJECT-NAME-WITH-UUID
│  └── <add files for a specifig student here>
├── PROJECT-NAME-WITH-UUID
│  └── <add files for a specifig student here>
└── <add files for ALL students here>
```

`src/main/config/editorConfig.json`: Configure which groups should be updated and define the commit message:

```json
{
   "onlyUpdateTestProjects": false,
   "onlyUpdateCodeProjects": false,
   "groupIds": [
      1862
   ],
   "logLevel": "info",
   "commitMsg": "individual update test"
}
```

## Changelog

### 1.0.0

- add individual updates per project

### 0.1.1

- add feature to force create/update

### 0.1.0

- add feature to update or create files based on given structure in `asset/*/` for all repositories

### 0.0.1

- initialize project based on the divekit-evaluation-processor
