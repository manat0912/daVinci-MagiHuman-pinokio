module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "app/env",
        env: {
          USE_LIBUV: "0"
        },
        path: ".",
        message: [
          "python launcher.py"
        ]
      }
    }
  ]
}
