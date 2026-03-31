module.exports = {
  run: [
    // 1. Clone the main repository if it doesn't exist
    {
      method: "shell.run",
      params: {
        message: [
          "{{exists('app') ? '' : 'git clone https://github.com/GAIR-NLP/daVinci-MagiHuman.git app'}}",
        ]
      }
    },
    // 2. Set up virtual environment
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "uv venv --python 3.12 --clear env",
        ]
      }
    },
    // 3. Run torch.js for torch-related dependencies FIRST so the correct torch version is installed
    {
      method: "script.start",
      params: {
        uri: "torch.js",
        params: {
          venv: "env",
          path: "app",
          flashattention: true,
          xformers: true,
          triton: true,
          sageattention: true
        }
      }
    },
    // 4. Install dependencies from requirements
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install gradio devicetorch",
          "{{exists('requirements-windows.txt') ? 'uv pip install -r requirements-windows.txt' : 'uv pip install -r requirements.txt'}}",
        ]
      }
    },
    // 5. Install MagiCompiler and MagiAttention
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          // MagiCompiler clone (check for README to ensure checkout succeeded)
          "{{exists('MagiCompiler/README.md') ? '' : 'if exist MagiCompiler rmdir /s /q MagiCompiler & git clone https://github.com/SandAI-org/MagiCompiler.git'}}",
          "uv pip install -e MagiCompiler",
          // MagiAttention clone with Windows fix (using git clone -n, disabling protectNTFS, removing bad paths from index, checking out, and returning to parent dir)
          "{{exists('MagiAttention/README.md') ? '' : (platform === 'win32' ? 'if exist MagiAttention rmdir /s /q MagiAttention & git clone -n https://github.com/SandAI-org/MagiAttention.git && cd MagiAttention && git config core.protectNTFS false && git reset HEAD && git rm --cached -r assets && git checkout . && git submodule update --init --recursive && cd ..' : 'git clone --recursive https://github.com/SandAI-org/MagiAttention.git')}}",
          "uv pip install -e MagiAttention"
        ]
      }
    }
  ]
}
