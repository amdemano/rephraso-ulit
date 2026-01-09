**Rephraso✨**
_Rephraso_ is a full-stack AI writing assistant that rephrases text into different tones (Professional, Friendly, Funny, etc.) using Azure OpenAI.

**🚀 Getting Started**
Follow these steps to get the project running in your development environment.1.
**1. Prerequisites**
  - Node.js (v18 or higher recommended).
  - An Azure OpenAI Service resource with a deployed model.
    
**2. Installation**
  - Clone the repository and install dependencies for the backend
      cd backend
      npm install
    
**3. Environment Setup**
Create a .env file inside the /backend folder and add your Azure credentials. Do not commit this file to GitHub.
      AZURE_OPENAI_KEY=your_actual_api_key_here
      AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
      
      AZURE_OPENAI_DEPLOYMENT=""
      
      AZURE_OPENAI_API_VERSION=""
      
  _  Note: The AZURE_OPENAI_DEPLOYMENT must match the Deployment Name in your Azure AI Studio exactly._
  
**4. Running the App**
Start the server from the backend directory:
      node server.js
_The backend will run on http://localhost:3000._

**5. Codespaces Port Forwarding**
If you are using GitHub Codespaces, ensure Port 3000 is forwarded:
- Go to the Ports tab in the bottom panel.
- Click the Local Address link for Port 3000 to open the frontend in your browser.

**🛠 Project Structure**
/backend: Contains the Express server logic and API routes.
/frontend: Contains the index.html and UI styling.
