module.exports = {
  run: [{
    method: "shell.run",
    params: {
      message: "git pull"
    }
  }, {
    method: "shell.run",
    params: {
      path: "app",
      message: "git pull"
    }
  }, {
    // Clone MagiCompiler if it doesn't exist
    "when": "{{!exists('app/MagiCompiler')}}",
    method: "shell.run",
    params: {
      path: "app",
      message: "git clone https://github.com/SandAI-org/MagiCompiler.git"
    }
  }, {
    // Clone MagiAttention if it doesn't exist
    "when": "{{!exists('app/MagiAttention')}}",
    method: "shell.run",
    params: {
      path: "app",
      message: "git clone --recursive https://github.com/SandAI-org/MagiAttention.git"
    }
  }, {
    // Force/Upgrade to Python 3.12 if needed
    method: "shell.run",
    params: {
      path: "app",
      message: [
        "uv venv --python 3.12 env",
      ]
    }
  }, {
    // Install everything in the virtual environment
    method: "shell.run",
    params: {
      venv: "env",
      path: "app",
      message: [
        "uv pip install gradio devicetorch",
        "uv pip install -r requirements.txt",
        "uv pip install -e MagiCompiler",
        "uv pip install -e MagiAttention"
      ]
    }
  }]
}
