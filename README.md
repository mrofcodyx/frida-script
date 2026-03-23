# frida-script by mr_ofcodyx 

Coleção de scripts Frida para bypass de proteções em aplicativos Android, desenvolvida para testes de segurança e análise de aplicações.
<p align="center"><img src="https://i.imgur.com/50BL5i8.jpeg" width="600"/></p>

## 🔧 Scripts Disponíveis

### `noxdroidpriv.js`

Script Frida avançado que combina várias técnicas para burlar detecções comuns em aplicações Android, como:

- **Detecção de root** (Magisk, SuperSU, KernelSU, etc.)
- **Detecção de emulador** (Nox, QEMU, libhoudini)
- **SSL Pinning** (OkHttp, Conscrypt, NetworkSecurityConfig)
- **Anti-debug** (Frida, ADB, depurador)
- **Proteção de tela** (FLAG_SECURE)
- **Hardware Keystore** (StrongBox, Fingerprint)

Ideal para análises em apps bancários, de segurança ou qualquer aplicação com proteções agressivas.

## 🚀 Funcionalidades

### 1. Root Bypass
- Bloqueia acesso a binários suspeitos (`su`, `busybox`, `magisk`, `ksu`)
- Hook em `Runtime.exec` para impedir execução de comandos root
- `File.exists` falso para caminhos comuns de root
- Ocultação de apps de gerenciamento root via `PackageManager`
- Falsificação das propriedades `ro.debuggable`, `ro.secure` e `ro.build.tags`

### 2. Emulador Bypass
- Spoof das propriedades `Build` (modelo, fabricante, fingerprint) para um Pixel 2 real
- Força `SDK_INT` = 28 (Android 9)
- Hook em `TelephonyManager` para retornar dados de operadora real
- Bloqueio de arquivos e pipes do QEMU (`/dev/qemu_pipe`, etc.)
- Modificação de `/proc/cpuinfo` para esconder características de virtualização
- Neutralização da detecção via libhoudini (tradução ARM → x86)

### 3. SSL Pinning Bypass
- TrustManager universal que aceita qualquer certificado
- Substituição do `SSLContext.getDefault` pelo contexto personalizado
- Hook em `TrustManagerImpl` (Conscrypt) para ignorar verificações de cadeia
- Bloqueio de métodos de pinning em OkHttp, Squareup, Trustkit e outras bibliotecas
- Compatível com aplicações que usam NetworkSecurityConfig (Android 7+)

### 4. Anti-Frida Detection
- Bloqueio de portas típicas do Frida (27042, 27043, 27044)
- Ocultação de arquivos e pipes relacionados ao Frida (`/proc/self/maps`, etc.)
- Remoção de threads do Frida da listagem de threads
- Interceptação de conexões socket para os endereços do Frida
- Desativação de detecção de depurador via `Debug.isDebuggerConnected`

### 5. Outros
- **ADB Bypass**: `Debug.isDebuggerConnected` → false, desativa `adb_enabled`
- **Keystore Bypass**: simula hardware seguro, desativa StrongBox, retorna `true` para `isDeviceSecure`
- **Screen Bypass**: remove `FLAG_SECURE` de janelas, permitindo captura de tela

## 📦 Pré-requisitos

- Python 3.x e Frida instalados:
  ```bash
  pip install frida-tools

- Dispositivo Android com root (ou emulador) e USB Debugging ativado.
  ```
  frida -U -f com.pacote.do.app -l noxdroidpriv.js

## ⚡confira -> [**NoxDroid Tool**](https://github.com/mrofcodyx/noxdroid)
<p align="center"><img src="https://i.imgur.com/uDy50Fj.jpeg" width="800"/></p>
