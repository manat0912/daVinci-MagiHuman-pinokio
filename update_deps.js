module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "git clone https://github.com/SandAI-org/MagiCompiler.git",
          "uv pip install -e MagiCompiler",
          "git clone --recursive https://github.com/SandAI-org/MagiAttention.git",
          "uv pip install -e MagiAttention"
        ]
      }
    }
  ]
}
