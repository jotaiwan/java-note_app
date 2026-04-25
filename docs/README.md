# Note App
Note App is a note-taking application built with Spring Boot and React, providing a simple yet powerful platform to create, manage, and organize your notes.

# Technology Stack
- Backend: Spring Boot (Java)
- Frontend: React (JavaScript)
- Database: PostgreSQL
- Containerization: Docker

# Prerequisites
- Docker (optional, for containerized deployment)
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher

# Installation
Clone the repository:
```bash
git clone https://github....
cd note_app
```
Set up the environment:
```bash
./setup.sh
```
Configure environment variables:

* Create a .env file in the project root directory and add the following content:
```bash
NOTE_APP_JDBC_D...=jdbc:postgresql://localhost:5432/note_app
NOTE_APP_JDBC_D...=your_db_username
NOTE_APP_JDBC_D...=your_db_password
```

# Usage
Using the interactive menu
```bash
./run_dev.sh
```
This will launch an interactive menu, allowing you to choose to start the frontend, backend, or Docker containers.

# Manual startup
Start the backend:
```bash
cd backend
mvn spring-boot:run
```
Start the frontend:
```bash
cd frontend
npm start
```

# Docker
To deploy Note App using Docker:

* Ensure you have Docker and Docker Compose installed.
* Run the following command:
```bash
docker-compose up -d
```
This will start the backend, frontend, and PostgreSQL database containers.

# Frequently Asked Questions
How do I access the application?
- Frontend: http://localhost:5000
- Backend: http://localhost:5099

How do I configure the database?
Configure the PostgreSQL database connection information in the .env file. If using Docker, the database will be automatically configured.

How do I customize the application?
- Backend: Modify the Java code in backend/src/main/java.
- Frontend: Modify the React components in frontend/src.

How do I build a production version?
Build the backend:
```bash
cd backend
mvn clean package
```
Build the frontend:
```bash
cd frontend
npm run build
```
Deploy using Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

# Contributing
Contributions are welcome! Please follow these steps:

Fork this repository.
- Create your feature branch (git checkout -b feature/AmazingFeature).
- Commit your changes (git commit -m 'Add some AmazingFeature').
- Push to the branch (git push origin feature/AmazingFeature).
- Open a Pull Request.


# Folder Structure
```bash
note_app
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── noteapp/
│   │   │           ├── config/
│   │   │           │   └── CorsConfig.java
│   │   │           ├── context/
│   │   │           │   └── NoteOperationContext.java
│   │   │           ├── controller/
│   │   │           │   ├── ApiController.java
│   │   │           │   ├── CredentialController.java
│   │   │           │   ├── DocController.java
│   │   │           │   ├── NoteController.java
│   │   │           │   ├── NoteFileSqlGeneratorController.java
│   │   │           │   └── StockController.java
│   │   │           ├── dto/
│   │   │           │   ├── NoteAttachmentDto.java
│   │   │           │   └── NoteDto.java
│   │   │           ├── entity/
│   │   │           │   ├── Note.java
│   │   │           │   ├── NoteAttachment.java
│   │   │           │   ├── NoteEntityListener.java
│   │   │           │   └── NoteImage.java
│   │   │           ├── repository/
│   │   │           │   ├── NoteAttachmentRepository.java
│   │   │           │   ├── NoteAttachmentRepositoryImpl.java
│   │   │           │   ├── NoteRepository.java
│   │   │           │   ├── NoteRepositoryCustom.java
│   │   │           │   └── NoteRepositoryImpl.java
│   │   │           ├── service/
│   │   │           │   ├── CsvSqlGeneratorService.java
│   │   │           │   ├── NoteService.java
│   │   │           │   └── StockService.java
│   │   │           ├── strategy/
│   │   │           │   ├── CreateNoteStrategy.java
│   │   │           │   ├── NoteStrategy.java
│   │   │           │   └── UpdateNoteStrategy.java
│   │   │           └── util/
│   │   │               ├── CredentialReader.java
│   │   │               ├── FileUtil.java
│   │   │               └── LoggerNameConverter.java
│   │   │           └── NoteAppApplication.java
│   │   └── resources/
│   │       ├── application-dev.properties
│   │       ├── application-docker.properties
│   │       ├── application.properties
│   │       └── logback-spring.xml
│   └── test/
│       └── java/
│           └── com/
│               └── noteapp/
│                   └── NoteAppApplicationTests.java
├── frontend/
│   ├── build/
│   │   ├── assets/
│   │   │   └── images/
│   │   │       └── menu/
│   │   │           ├── chatgpt-icon.png
│   │   │           ├── github_logo.png
│   │   │           ├── gitlab.png
│   │   │           ├── jenkins_logo.svg.png
│   │   │           ├── jira_cloud.png
│   │   │           ├── jira_cloud_logo.png
│   │   │           ├── salesforce.com_logo.svg.png
│   │   │           ├── tool-home-page.png
│   │   │           ├── tripadvisor-4.png
│   │   │           ├── vault.png
│   │   │           ├── vault.svg
│   │   │           ├── viator-3.png
│   │   │           ├── work-note.png
│   │   │           ├── work-note.svg
│   │   │           └── work-note2.png
│   │   └── static/
│   │       ├── css/
│   │       │   ├── 538.47d24098.chunk.css
│   │       │   ├── 934.dcc28dba.chunk.css
│   │       │   └── main.ad9b7acb.css
│   │       └── js/
│   │           ├── 199.2a5981bd.chunk.js
│   │           ├── 254.b86ccd29.chunk.js
│   │           ├── 254.b86ccd29.chunk.js.LICENSE.txt
│   │           ├── 538.66c62978.chunk.js
│   │           ├── 685.e24429fc.chunk.js
│   │           ├── 811.90a25a95.chunk.js
│   │           ├── 910.3260d9a9.chunk.js
│   │           ├── 934.ca699bf3.chunk.js
│   │           ├── main.78f214cd.js
│   │           └── main.78f214cd.js.LICENSE.txt
│   │   ├── asset-manifest.json
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── public/
│   │   └── assets/
│   │       └── images/
│   │           └── menu/
│   │               ├── chatgpt-icon.png
│   │               ├── github_logo.png
│   │               ├── gitlab.png
│   │               ├── jenkins_logo.svg.png
│   │               ├── jira_cloud.png
│   │               ├── jira_cloud_logo.png
│   │               ├── salesforce.com_logo.svg.png
│   │               ├── tool-home-page.png
│   │               ├── tripadvisor-4.png
│   │               ├── vault.png
│   │               ├── vault.svg
│   │               ├── viator-3.png
│   │               ├── work-note.png
│   │               ├── work-note.svg
│   │               └── work-note2.png
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src/
│       ├── components/
│       │   ├── MarkdownViewer/
│       │   │   ├── MarkdownViewer.jsx
│       │   │   └── MarkdownViewer.module.css
│       │   ├── attachments/
│       │   │   ├── DragDropOverlay/
│       │   │   │   ├── DragDropOverlay.jsx
│       │   │   │   ├── DragDropOverlay.module.css
│       │   │   │   └── index.js
│       │   │   ├── FilePreview/
│       │   │   │   ├── FilePreview.jsx
│       │   │   │   ├── FilePreview.module.css
│       │   │   │   └── index.js
│       │   │   ├── hooks/
│       │   │   │   ├── index.js
│       │   │   │   ├── useAttachments.js
│       │   │   │   ├── useDragAndDrop.js
│       │   │   │   └── useFileUpload.js
│       │   │   └── utils/
│       │   │       ├── attachmentHelpers.js
│       │   │       ├── constants.js
│       │   │       ├── errorMessages.js
│       │   │       ├── fileConstants.js
│       │   │       ├── fileHelpers.js
│       │   │       ├── index.js
│       │   │       └── saveUtils.js
│       │   │   └── index.js
│       │   ├── emoji/
│       │   │   ├── EmojiPicker.js
│       │   │   ├── EmojiPicker.module.css
│       │   │   ├── EmojiTextArea.jsx
│       │   │   ├── EmojiTextArea.module.css
│       │   │   └── index.js
│       │   ├── notes/
│       │   │   ├── NoteRow/
│       │   │   │   ├── components/
│       │   │   │   │   ├── Attachments/
│       │   │   │   │   │   ├── AttachmentGrid.jsx
│       │   │   │   │   │   ├── AttachmentGrid.module.css
│       │   │   │   │   │   └── index.js
│       │   │   │   │   ├── EditMode/
│       │   │   │   │   │   ├── DragDropOverlay.jsx
│       │   │   │   │   │   ├── EditMode.jsx
│       │   │   │   │   │   ├── EditMode.module.css
│       │   │   │   │   │   ├── FilePreview.jsx
│       │   │   │   │   │   ├── FilePreview.module.css
│       │   │   │   │   │   └── index.js
│       │   │   │   │   └── ViewMode/
│       │   │   │   │       ├── NoteHeader.jsx
│       │   │   │   │       ├── ViewMode.jsx
│       │   │   │   │       ├── ViewMode.module.css
│       │   │   │   │       └── index.js
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── index.js
│       │   │   │   │   ├── useAttachmentPreload.js
│       │   │   │   │   ├── useDragBlocker.js
│       │   │   │   │   ├── useDragProtection.js
│       │   │   │   │   ├── useDragStats.js
│       │   │   │   │   ├── useFileUpload.js.backup
│       │   │   │   │   └── useNoteEdit.js
│       │   │   │   └── utils/
│       │   │   │       ├── attachmentHelpers.js
│       │   │   │       ├── fileHelpers.js
│       │   │   │       └── index.js
│       │   │   │   ├── NoteRow.jsx
│       │   │   │   ├── NoteRow.module.css
│       │   │   │   └── index.js
│       │   │   ├── NoteStatus/
│       │   │   │   ├── NoteStatus.jsx
│       │   │   │   ├── NoteStatus.module.css
│       │   │   │   ├── index.js
│       │   │   │   └── noteStatusHelpers.js
│       │   │   ├── TextRenderer/
│       │   │   │   ├── renderers/
│       │   │   │   │   ├── AttachmentRenderer.jsx
│       │   │   │   │   ├── AttachmentRenderer.module.css
│       │   │   │   │   ├── LineBreakRenderer.jsx
│       │   │   │   │   ├── LineBreakRenderer.module.css
│       │   │   │   │   ├── LinkRenderer.jsx
│       │   │   │   │   ├── LinkRenderer.module.css
│       │   │   │   │   ├── ScreenshotRenderer.jsx
│       │   │   │   │   ├── TextTagRenderer.jsx
│       │   │   │   │   ├── TextTagRenderer.module.css
│       │   │   │   │   └── index.js
│       │   │   │   └── utils/
│       │   │   │       ├── htmlSanitizer.js
│       │   │   │       └── regexPatterns.js
│       │   │   │   ├── TextRenderer.jsx
│       │   │   │   ├── TextRenderer.module.css
│       │   │   │   └── index.js
│       │   │   ├── TicketGroup/
│       │   │   │   ├── TicketGroup.jsx
│       │   │   │   ├── TicketGroup.module.css
│       │   │   │   └── index.js
│       │   │   ├── TicketSummary/
│       │   │   │   ├── TicketSummary.jsx
│       │   │   │   ├── TicketSummary.module.css
│       │   │   │   └── index.js
│       │   │   └── utils/
│       │   │       └── dateHelper.js
│       │   │   └── index.js
│       │   ├── shared/
│       │   │   └── DateTimePicker/
│       │   │       ├── DateTimePicker.jsx
│       │   │       └── DateTimePicker.module.css
│       │   └── stockTicker/
│       │       ├── StockTicker.jsx
│       │       ├── StockTicker.module.css
│       │       └── index.js
│       │   └── Portal.jsx
│       ├── hooks/
│       │   ├── index.js
│       │   ├── useAttachmentUpload.js
│       │   ├── useCopyToClipboard.js
│       │   ├── useCredential.js
│       │   ├── useDateFilter.js
│       │   ├── useDebounce.js
│       │   ├── useDropdown.js
│       │   ├── useForm.js
│       │   ├── useImageUpload.js
│       │   ├── useModal.js
│       │   ├── useNotes.js
│       │   ├── useRunningEnv.js
│       │   ├── useShortcutCommands.js
│       │   └── useTextArea.js
│       ├── pages/
│       │   └── notes/
│       │       ├── components/
│       │       │   ├── AddNoteModal/
│       │       │   │   ├── components/
│       │       │   │   │   ├── DateTimePicker.jsx
│       │       │   │   │   ├── NoteTextArea.jsx
│       │       │   │   │   ├── StatusButtons.jsx
│       │       │   │   │   └── StatusButtons.module.css
│       │       │   │   └── utils/
│       │       │   │       ├── dateUtils.js
│       │       │   │       └── fileUtils.js
│       │       │   │   ├── AddNoteModal.jsx
│       │       │   │   ├── AddNoteModal.module.css
│       │       │   │   └── index.js
│       │       │   ├── Auth/
│       │       │   │   ├── VaultAuth.jsx
│       │       │   │   ├── VaultAuth.module.css
│       │       │   │   └── index.js
│       │       │   ├── NoteHeader/
│       │       │   │   ├── NoteHeader.jsx
│       │       │   │   ├── NoteHeader.module.css
│       │       │   │   └── index.js
│       │       │   ├── NoteList/
│       │       │   │   ├── NoteList.jsx
│       │       │   │   ├── NoteList.module.css
│       │       │   │   └── index.js
│       │       │   ├── NoteMenu/
│       │       │   │   ├── NoteMenu.jsx
│       │       │   │   ├── NoteMenu.module.css
│       │       │   │   └── index.js
│       │       │   ├── NoteSummary/
│       │       │   │   └── recent/
│       │       │   │   ├── NoteSummary.jsx
│       │       │   │   ├── NoteSummary.module.css
│       │       │   │   └── index.js
│       │       │   ├── ProjectSelector/
│       │       │   │   ├── configs/
│       │       │   │   │   ├── group1/
│       │       │   │   │   │   ├── environment.js
│       │       │   │   │   │   ├── index.js
│       │       │   │   │   │   ├── linkMapping.js
│       │       │   │   │   │   └── project.js
│       │       │   │   │   ├── group2/
│       │       │   │   │   │   ├── environment.js
│       │       │   │   │   │   ├── index.js
│       │       │   │   │   │   ├── linkMapping.js
│       │       │   │   │   │   └── project.js
│       │       │   │   │   └── personal/
│       │       │   │   │       ├── environment.js
│       │       │   │   │       ├── index.js
│       │       │   │   │       ├── linkMapping.js
│       │       │   │   │       └── project.js
│       │       │   │   ├── old/
│       │       │   │   │   ├── ProjectSelector.jsx
│       │       │   │   │   ├── ProjectSelector.module.css
│       │       │   │   │   ├── environment.js
│       │       │   │   │   ├── index.js
│       │       │   │   │   └── project.js
│       │       │   │   └── utils/
│       │       │   │       └── configLoader.js
│       │       │   │   ├── ProjectSelector.jsx
│       │       │   │   ├── ProjectSelector.module.css
│       │       │   │   └── index.js
│       │       │   ├── QuickLinks/
│       │       │   │   ├── configs/
│       │       │   │   │   ├── group1/
│       │       │   │   │   │   └── linksConfig.js
│       │       │   │   │   ├── group2/
│       │       │   │   │   │   └── linksConfig.js
│       │       │   │   │   ├── old/
│       │       │   │   │   │   ├── environment.js
│       │       │   │   │   │   ├── index.js
│       │       │   │   │   │   └── project.js
│       │       │   │   │   └── personal/
│       │       │   │   │       └── linksConfig.js
│       │       │   │   └── utils/
│       │       │   │       └── configLoader.js
│       │       │   │   ├── QuickLinks.jsx
│       │       │   │   ├── QuickLinks.module.css
│       │       │   │   └── index.js
│       │       │   ├── ShortcutCommands/
│       │       │   │   ├── ShortcutCommands.jsx
│       │       │   │   ├── ShortcutCommands.module.css
│       │       │   │   ├── index.js
│       │       │   │   └── shortcuts.js
│       │       │   └── shared/
│       │       │       └── groupNameConstants.js
│       │       │   └── index.js
│       │       └── sqlPreviewModal/
│       │           ├── SqlPreviewModal.jsx
│       │           └── SqlPreviewModal.module.css
│       │       ├── Index.jsx
│       │       └── Index.module.css
│       ├── routes/
│       │   └── index.js
│       ├── service/
│       │   ├── api.js
│       │   ├── attachmentService.js
│       │   ├── credentialService.js
│       │   ├── index.js
│       │   └── noteService.js
│       └── styles/
│           └── globals.css
│       ├── About.jsx
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── Hello.jsx
│       ├── Home.jsx
│       ├── fontawesome.js
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── reportWebVitals.js
│       ├── setupProxy.js
│       └── setupTests.js
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   ├── nginx-frontend.conf
│   ├── package-lock.json
│   └── package.json
├── .gitignore
├── Dockerfile
├── README.md
├── db_setup.sh
├── docker-compose.yml
├── install_env_java.sh
├── mvnw
├── mvnw.cmd
├── nginx.Dockerfile
├── nginx.conf
├── pom.xml
├── rebuild_frontend.sh
└── run_dev.sh
```

# License
Nil
