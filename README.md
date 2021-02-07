# Alfred Open in VSCode

Alfred 4 workflow to open in VSCode

## Feature

- Search projects and open in VSCode.
- Search projects and reveal in Finder.
- Open selected file in VSCode.
- Fuzzy search.

## Installation

- Download and open workflow in Alfred or `npm i -g alfred-open-in-vscode`
- Set workflow environment `wds` to your project base folders (split with ,). e.g. `wds: /Users/vivaxy/Developers/github,/Users/vivaxy/Developers/gitlab`. Workflow searches only first level folders, so make sure `wds` point to them. `wds` stands for `working directories`.

## Usage

- Type `code` with a space to search. Press `enter` to open selected project in VSCode. Hold `command` and press `enter` to reveal in Finder.
- Select a file in Finder, type `code` (without space) and press `enter` to open this folder in VSCode.
