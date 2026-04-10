// import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import AppProvider from "./context/AppProvider.tsx"
import "@/styles/global.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <AppProvider>
        <App />
    </AppProvider>,
    // </React.StrictMode>
)
"// Deployment trigger $(date)"  
"// Vercel redeploy trigger $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"  
// Force redeploy 02/06/2026 18:27:21
// redeploy  
