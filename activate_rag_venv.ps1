# activate_rag_venv.ps1

# --- Important Note: This script must be run using dot-sourcing in PowerShell ---
# Example: . .\activate_rag_venv.ps1
# This ensures the virtual environment activation modifies the *current* session.

Write-Host "Activating CocoIndex RAG virtual environment..."

# Define the path to the rag_pipeline directory
$ragPipelinePath = "backend\rag_pipeline"

# Check if the directory exists
if (-not (Test-Path $ragPipelinePath -PathType Container)) {
    Write-Error "Error: The '$ragPipelinePath' directory was not found. Please ensure it exists."
    return
}

# Navigate to the rag_pipeline directory
Set-Location $ragPipelinePath
Write-Host "Navigated to: $(Get-Location)"

# Define the path to the activate script within the venv
$venvActivateScript = ".\venv\Scripts\Activate.ps1"

# Check if the activate script exists
if (-not (Test-Path $venvActivateScript -PathType Leaf)) {
    Write-Error "Error: The virtual environment activation script '$venvActivateScript' was not found."
    Write-Error "Please ensure you have run 'python -m venv venv' and 'pip install -r requirements.txt' in the '$ragPipelinePath' directory."
    return
}

# Source the activate script to activate the venv in the current session
. $venvActivateScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "Virtual environment activated successfully."
    Write-Host "You are now in the 'backend\rag_pipeline' directory."
    Write-Host "Your prompt should now show '(venv)'."
} else {
    Write-Error "Failed to activate virtual environment."
}