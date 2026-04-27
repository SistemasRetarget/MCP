# ---- Single stage: Node + Rust toolchain ----
FROM node:18-bookworm-slim

# Instalar Rust
RUN apt-get update && apt-get install -y curl build-essential pkg-config && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal --default-toolchain 1.85.0 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Compilar servidor Rust
COPY servers/quality-gate/Cargo.toml servers/quality-gate/Cargo.lock ./rust-build/
COPY servers/quality-gate/src ./rust-build/src
RUN cd rust-build && cargo build --release && \
    mkdir -p /app/servers/quality-gate/target/release && \
    cp target/release/quality-gate-server /app/servers/quality-gate/target/release/ && \
    cd /app && rm -rf rust-build

# Copiar workspace MCP
COPY contracts ./contracts
COPY lessons ./lessons
COPY tools ./tools
COPY mcp-config.json ./
COPY mcp-subagents-config.json ./
COPY http-wrapper.mjs ./

ENV NODE_ENV=production
ENV PORT=8080
ENV WORKSPACE_MCP_HOME=/app
ENV RETARGET_WORKSPACE=/app/contracts

EXPOSE 8080

CMD ["node", "http-wrapper.mjs"]
