import os
import subprocess
import sys

def main():
    app_dir = "app"
    prompt_file = os.path.join(app_dir, "example", "assets", "prompt.txt")
    
    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            prompt_text = f.read().strip()
    except FileNotFoundError:
        print(f"Error: Prompt file not found at {prompt_file}")
        sys.exit(1)

    env = os.environ.copy()
    env["MASTER_ADDR"] = env.get("MASTER_ADDR", "localhost")
    env["MASTER_PORT"] = env.get("MASTER_PORT", "6009")
    env["NNODES"] = env.get("NNODES", "1")
    env["NODE_RANK"] = env.get("NODE_RANK", "0")
    env["GPUS_PER_NODE"] = env.get("GPUS_PER_NODE", "1")
    env["WORLD_SIZE"] = str(int(env["GPUS_PER_NODE"]) * int(env["NNODES"]))
    env["PYTORCH_CUDA_ALLOC_CONF"] = env.get("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")
    env["NCCL_ALGO"] = env.get("NCCL_ALGO", "^NVLS")
    
    # Fix for Windows torchrun (use_libuv without libuv built-in)
    if os.name == "nt":
        env["USE_LIBUV"] = "0"
    
    # Ensure PYTHONPATH includes the app directory
    env["PYTHONPATH"] = app_dir + os.pathsep + env.get("PYTHONPATH", "")

    # Build the command
    # On Windows, bypass torchrun (elastic launch) for single-process runs to avoid libuv errors.
    if os.name == "nt" and env["WORLD_SIZE"] == "1":
        cmd = [
            sys.executable,
            os.path.join(app_dir, "inference", "pipeline", "entry.py"),
            "--config-load-path", os.path.join(app_dir, "example", "base", "config.json"),
            "--prompt", prompt_text,
            "--image_path", os.path.join(app_dir, "example", "assets", "image.png"),
            "--seconds", "4",
            "--br_width", "448",
            "--br_height", "256",
            "--output_path", "output_example_base",
            "--engine_config.distributed_backend", "gloo"
        ]
        # In a single-process run, initialize Rank/WorldSize for the script manually.
        env["RANK"] = "0"
        env["WORLD_SIZE"] = "1"
        env["MASTER_ADDR"] = "localhost"
        env["MASTER_PORT"] = env.get("MASTER_PORT", "6009")
    else:
        # Standard torchrun execution
        cmd = [
            sys.executable, "-m", "torch.distributed.run",
            f"--nnodes={env['NNODES']}",
            f"--node_rank={env['NODE_RANK']}",
            f"--nproc_per_node={env['GPUS_PER_NODE']}",
            "--rdzv-backend=c10d",
            f"--rdzv-endpoint={env['MASTER_ADDR']}:{env['MASTER_PORT']}",
            os.path.join(app_dir, "inference", "pipeline", "entry.py"),
            "--config-load-path", os.path.join(app_dir, "example", "base", "config.json"),
            "--prompt", prompt_text,
            "--image_path", os.path.join(app_dir, "example", "assets", "image.png"),
            "--seconds", "4",
            "--br_width", "448",
            "--br_height", "256",
            "--output_path", "output_example_base"
        ]
        # Force gloo on Windows since nccl is not supported
        if os.name == "nt":
            cmd.extend(["--engine_config.distributed_backend", "gloo"])

    print("=== daVinci-MagiHuman Cross-Platform Launcher ===")
    print("Running command:", " ".join(cmd))
    print("=================================================")
    
    # Run the process
    result = subprocess.run(cmd, env=env)
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
