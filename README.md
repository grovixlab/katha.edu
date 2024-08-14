## Katha - Library Management Software

**Katha** is a library management software developed by Grovix Lab, designed to streamline library operations. This software is open-source and published under the [MIT License](https://github.com/grovixlab/katha/blob/main/LICENSE).

### Prerequisites

1. **MongoDB**: Download and install MongoDB from the [official MongoDB website](https://www.mongodb.com/try/download/community).
2. **Node.js**: Download and install Node.js from the [official Node.js website](https://nodejs.org/).

### Installation Instructions

1. **Download Software**:
   - Go to our [GitHub repository](https://github.com/grovixlab/katha) to download the software files.

2. **Unzip the File**:
   - After downloading, unzip the file to your desired directory.

3. **Set Up Your Code Editor**:
   - We recommend using [Visual Studio Code](https://code.visualstudio.com/) for editing and managing the code.

4. **Configure Environment Variables**:
   - In the root directory of the unzipped files, create a file named `.env`.
   - Add your admin credentials to this file with the following format:

     ```
     USER=<your username>
     PASSW=<your password>
     ```

5. **Install npm Packages**:
   - Open a terminal in the directory where you unzipped the files.
   - Run the command: `npm install` to install all necessary packages.

6. **Start the Server**:
   - In the terminal, start the server by running: `node ./bin/www`.

### Running the Server Continuously

To ensure the server runs 24/7 or starts automatically when the system boots up, you need to create a script and configure it for automatic execution.

**For Windows:**

1. Create a `.bat` file:
   - Open Notepad and write the following script:

     ```bat
     @echo off
     cd /d "C:\path\to\your\katha\directory"
     node ./bin/www
     ```

   - Save this file with a `.bat` extension, for example, `start-katha.bat`.

2. Add to Startup:
   - Press `Win + R`, type `shell:startup`, and press Enter.
   - Place a shortcut to the `.bat` file in the startup folder.

**For Linux/MacOS:**

1. Create a `.sh` file:
   - Open a terminal and write the following script:

     ```bash
     #!/bin/bash
     cd /path/to/your/katha/directory
     node ./bin/www
     ```

   - Save this file with a `.sh` extension, for example, `start-katha.sh`.

   - Make it executable with the command: `chmod +x start-katha.sh`.

2. Add to Startup:
   - To run on system startup, add the script to your system’s startup applications or use `cron` jobs. For example, edit the `crontab` with `crontab -e` and add:

     ```bash
     @reboot /path/to/start-katha.sh
     ```

### Support

If you have any questions or need further assistance, please contact our support team at [support@grovixlab.com](mailto:support@grovixlab.com).