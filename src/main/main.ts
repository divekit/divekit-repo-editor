import {RepoEditor} from "./RepoEditor"


const rootSomething = new RepoEditor()
rootSomething.validateConfig()
rootSomething.execute()

// OpenTasks
// - get all repositories from given code and test directories (config)
// - change (overwrite) one file for everyone -> test with evaluation.md and NoteTest.java
// - append content to the end of the file
// - read .json config from code generation
// - change (overwrite) file per variation
// - update file with automated merge to preserve changes