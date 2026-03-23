// ========== NOXDROID by Mr_ofcodyx==========
// Anti-Frida Detection

"use strict";

var CONFIG = {
    ROOT_BYPASS:        true,
    NATIVE_BYPASS:      true,
    ADB_BYPASS:         true,
    EMULATOR_BYPASS:    true,
    KEYSTORE_BYPASS:    true,
    SSL_PINNING_BYPASS: true,
    HTTP_INTERCEPT:     false,
    SCREEN_BYPASS:      true,
    FRIDA_BYPASS:       true,
    MAX_BODY_LOG:       4096,
};

// ═══════════════════════════════════════════════════════════════════
//  OUTPUT SYSTEM
// ═══════════════════════════════════════════════════════════════════
var C = {
    rst:  "\x1b[0m",
    r:    "\x1b[31m", g:    "\x1b[32m", y:    "\x1b[33m",
    b:    "\x1b[34m", m:    "\x1b[35m", c:    "\x1b[36m",
    w:    "\x1b[37m", gr:   "\x1b[90m",
    bold: "\x1b[1m",  dim:  "\x1b[2m",
    br:   "\x1b[91m", bg:   "\x1b[92m", by:   "\x1b[93m",
    bc:   "\x1b[96m", bw:   "\x1b[97m",
};

var TAG = {
    ROOT:   C.br   + " ROOT "   + C.rst,
    ADB:    C.y    + " ADB  "   + C.rst,
    EMU:    C.by   + " EMU  "   + C.rst,
    SSL:    C.bc   + " SSL  "   + C.rst,
    KS:     C.c    + " KS   "   + C.rst,
    HTTP:   C.bg   + " HTTP "   + C.rst,
    SCREEN: C.gr   + "SCREEN"   + C.rst,
    NAT:    C.m    + " NAT  "   + C.rst,
    FRIDA:  C.r    + "FRIDA "   + C.rst,
};

var I = {
    ok:   C.bg   + "✔" + C.rst,
    skip: C.gr   + "·" + C.rst,
    warn: C.by   + "!" + C.rst,
    err:  C.br   + "✘" + C.rst,
    dbg:  C.bc   + "→" + C.rst,
};

var STATS = {
    ROOT: { ok: 0, skip: 0 }, ADB: { ok: 0, skip: 0 },
    EMU: { ok: 0, skip: 0 }, SSL: { ok: 0, skip: 0 },
    KS: { ok: 0, skip: 0 }, HTTP: { ok: 0, skip: 0 },
    SCREEN: { ok: 0, skip: 0 }, NAT: { ok: 0, skip: 0 },
    FRIDA: { ok: 0, skip: 0 },
};

function ok(mod, msg) {
    STATS[mod].ok++;
    console.log(" " + TAG[mod] + "  " + I.ok + "  " + C.bw + msg + C.rst);
}

function skip(mod, msg, reason) {
    STATS[mod].skip++;
    console.log(" " + TAG[mod] + "  " + I.skip + "  " + C.gr + msg +
        (reason ? C.dim + "  (" + reason + ")" : "") + C.rst);
}

function info(mod, msg) {
    console.log(" " + TAG[mod] + "  " + I.dbg + "  " + C.c + msg + C.rst);
}

function sh(mod, label, fn) {
    try { fn(); }
    catch (e) {
        skip(mod, label, e.message.split("\n")[0].substring(0, 80));
    }
}

function section(title, icon) {
    var line = "─".repeat(Math.max(0, 52 - title.length));
    console.log("\n " + C.bold + C.gr + "┄┄┄" + C.rst +
        " " + C.bold + C.bw + (icon || "◆") + " " + title + C.rst +
        " " + C.gr + line + C.rst);
}

function banner() {
    console.log("");
    console.log(" " + C.gr + "╭────────────────────────────────────────────────────────╮" + C.rst);
    console.log(" " + C.gr + "│" + C.rst + "  " + C.bold + C.bc + "NoxDroid" + C.rst +
                " " + C.bw + "v5.1" + C.rst +
                C.gr + "  ·  " + C.rst +
                C.y  + "Android 9" + C.rst +
                C.gr + "  ·  " + C.rst +
                C.w  + "API 28" + C.rst +
                C.gr + "  ·  " + C.rst +
                C.m  + "Bank Safe" + C.rst +
                "                  " +
                C.gr + "│" + C.rst);
    console.log(" " + C.gr + "│" + C.rst +
                "  " + C.gr + "NAT ROOT ADB EMU KS SSL FRIDA" + C.rst +
                "                         " +
                C.gr + "│" + C.rst);
    console.log(" " + C.gr + "╰────────────────────────────────────────────────────────╯" + C.rst);
    console.log("");
}

function summary(elapsed) {
    console.log("");
    console.log(" " + C.gr + "╭─ resumo " + "─".repeat(49) + "╮" + C.rst);
    var mods = ["NAT","ROOT","ADB","EMU","KS","SSL","FRIDA"];
    mods.forEach(function(m) {
        var s = STATS[m];
        var bar = C.bg + "✔ " + s.ok + C.rst + "  " + C.gr + "· " + s.skip + C.rst;
        console.log(" " + C.gr + "│" + C.rst + "  " + TAG[m] + "  " + bar);
    });
    console.log(" " + C.gr + "│" + C.rst);
    console.log(" " + C.gr + "│" + C.rst + "  " + I.ok +
        "  " + C.bg + C.bold + "pronto" + C.rst +
        C.gr + "  ·  " + elapsed + "ms init" + C.rst);
    console.log(" " + C.gr + "╰" + "─".repeat(57) + "╯" + C.rst);
    console.log("");
}

// ═══════════════════════════════════════════════════════════════════
//  ROOT BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookRoot() {
    section("Root bypass", "⬡");

    var ROOT_PATHS = [
        "/system/app/Superuser.apk", "/system/xbin/su", "/system/bin/su",
        "/sbin/su", "/data/local/xbin/su", "/data/local/bin/su", "/data/local/su",
        "/system/sd/xbin/su", "/system/bin/failsafe/su", "/system/app/SuperSU",
        "/system/app/Magisk", "/sbin/.magisk", "/data/adb/magisk",
        "/cache/.disable_selinux", "/data/adb/ksu", "/data/adb/ksud", "/dev/ksu",
    ];
    var ROOT_CMDS = ["su", "which su", "id", "busybox", "mount", "ksud", "ksu"];

    sh("ROOT", "Runtime.exec", function () {
        var RT = Java.use("java.lang.Runtime");
        function blockCmd(cmd) {
            if (!cmd) return false;
            for (var i = 0; i < ROOT_CMDS.length; i++)
                if (cmd.indexOf(ROOT_CMDS[i]) !== -1) return true;
            return false;
        }
        RT.exec.overload("java.lang.String").implementation = function (cmd) {
            if (blockCmd(cmd)) { ok("ROOT","exec blocked: " + cmd); throw Java.use("java.io.IOException").$new("blocked"); }
            return this.exec(cmd);
        };
        RT.exec.overload("[Ljava.lang.String;").implementation = function (cmds) {
            var a = Java.array("java.lang.String", cmds);
            if (a.length > 0 && blockCmd(a[0])) { ok("ROOT","exec[] blocked: "+a[0]); throw Java.use("java.io.IOException").$new("blocked"); }
            return this.exec(cmds);
        };
        ok("ROOT", "Runtime.exec  (3 overloads)");
    });

    sh("ROOT", "File.exists", function () {
        Java.use("java.io.File").exists.implementation = function () {
            var p = this.getAbsolutePath();
            for (var i = 0; i < ROOT_PATHS.length; i++)
                if (p === ROOT_PATHS[i]) { ok("ROOT","File.exists blocked: "+p); return false; }
            if (p.indexOf("magisk")!=-1||p.indexOf(".supersu")!=-1||
                p.indexOf("kernelsu")!=-1||p.indexOf("/ksu")!=-1) {
                ok("ROOT","File.exists pattern: "+p); return false;
            }
            return this.exists();
        };
        ok("ROOT", "File.exists  (paths + patterns)");
    });

    sh("ROOT", "Build.TAGS", function () {
        Object.defineProperty(Java.use("android.os.Build"), "TAGS",
            { get: function () { return "release-keys"; } });
        ok("ROOT", "Build.TAGS → release-keys");
    });

    sh("ROOT", "PackageManager", function () {
        var RPKGS = ["com.noshufou.android.su","eu.chainfire.supersu","com.koushikdutta.superuser",
            "com.thirdparty.superuser","com.topjohnwu.magisk","me.weishu.kernelsu",
            "com.kingroot.kinguser","com.kingo.root"];
        Java.use("android.content.pm.PackageManager")
            .getPackageInfo.overload("java.lang.String","int").implementation = function(pkg,f) {
                for (var i=0;i<RPKGS.length;i++) if(pkg===RPKGS[i]) {
                    ok("ROOT","PackageManager blocked: "+pkg);
                    throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(pkg);
                }
                return this.getPackageInfo(pkg,f);
            };
        ok("ROOT", "PackageManager  ("+RPKGS.length+" pacotes)");
    });

    sh("ROOT", "SystemProperties", function () {
        var SP = Java.use("android.os.SystemProperties");
        function fp(k){if(k==="ro.debuggable")return "0";if(k==="ro.secure")return "1";if(k==="ro.build.tags")return "release-keys";return null;}
        SP.get.overload("java.lang.String").implementation=function(k){return fp(k)||this.get(k);};
        SP.get.overload("java.lang.String","java.lang.String").implementation=function(k,d){return fp(k)||this.get(k,d);};
        ok("ROOT", "SystemProperties");
    });
}

// ═══════════════════════════════════════════════════════════════════
//  ADB BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookAdb() {
    section("ADB bypass", "⬡");

    sh("ADB", "Debug.isDebuggerConnected", function () {
        var D = Java.use("android.os.Debug");
        D.isDebuggerConnected.implementation = function () { return false; };
        D.waitingForDebugger.implementation  = function () { return false; };
        ok("ADB", "isDebuggerConnected / waitingForDebugger → false");
    });

    sh("ADB", "Settings.Global", function () {
        Java.use("android.provider.Settings$Global")
            .getInt.overload("android.content.ContentResolver","java.lang.String","int")
            .implementation = function(cr,name,def) {
                if(name==="adb_enabled"||name==="development_settings_enabled"){
                    ok("ADB","Settings.Global."+name+" → 0"); return 0;
                }
                return this.getInt(cr,name,def);
            };
        ok("ADB", "Settings.Global");
    });
}

// ═══════════════════════════════════════════════════════════════════
//  EMULATOR BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookEmulator() {
    section("Emulator bypass", "⬡");

    sh("EMU", "Build props", function () {
        var B = Java.use("android.os.Build");
        var fake = {
            FINGERPRINT: "google/walleye/walleye:9/PQ3A.190705.003/5736940:user/release-keys",
            MODEL:"Pixel 2", MANUFACTURER:"Google", BRAND:"google",
            DEVICE:"walleye", PRODUCT:"walleye", HARDWARE:"walleye", BOARD:"walleye",
        };
        Object.keys(fake).forEach(function(k) {
            try { var v=fake[k]; Object.defineProperty(B,k,{get:function(){return v;}}); } catch(e) {}
        });
        ok("EMU", "Build props spoofados");
    });

    sh("EMU", "Build.VERSION.SDK_INT", function () {
        Object.defineProperty(Java.use("android.os.Build$VERSION"),"SDK_INT",
            {get:function(){return 28;}});
        ok("EMU", "SDK_INT → 28");
    });

    sh("EMU", "TelephonyManager", function () {
        var TM = Java.use("android.telephony.TelephonyManager");
        var patches = [
            ["getDeviceId",          function(){return "358239051448958";}],
            ["getNetworkOperatorName",function(){return "Vivo";}],
            ["getSimOperatorName",   function(){return "Vivo";}],
            ["getPhoneType",         function(){return 1;}],
            ["getNetworkType",       function(){return 13;}],
            ["getSimCountryIso",     function(){return "br";}],
            ["getNetworkCountryIso", function(){return "br";}],
        ];
        patches.forEach(function(p) {
            try { TM[p[0]].overload().implementation = p[1]; } catch(e) {}
        });
        ok("EMU", "TelephonyManager spoofado");
    });
}

// ═══════════════════════════════════════════════════════════════════
//  KEYSTORE BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookKeystore() {
    section("Keystore bypass", "⬡");

    sh("KS", "KeyInfo.isInsideSecureHardware", function () {
        Java.use("android.security.keystore.KeyInfo")
            .isInsideSecureHardware.implementation = function(){ return true; };
        ok("KS", "isInsideSecureHardware → true");
    });

    sh("KS", "KeyguardManager", function () {
        Java.use("android.app.KeyguardManager").isDeviceSecure.overload()
            .implementation = function(){ return true; };
        Java.use("android.app.KeyguardManager").isKeyguardSecure.overload()
            .implementation = function(){ return true; };
        ok("KS", "KeyguardManager → true");
    });

    sh("KS", "FingerprintManager", function () {
        try {
            var FM = Java.use("android.hardware.fingerprint.FingerprintManager");
            FM.isHardwareDetected.implementation = function(){ return false; };
            FM.hasEnrolledFingerprints.implementation = function(){ return false; };
            ok("KS", "FingerprintManager");
        } catch(e) { skip("KS", "FingerprintManager", e.message); }
    });
}

// ═══════════════════════════════════════════════════════════════════
//  SSL PINNING BYPASS (SIMPLIFICADO PARA APPS DE BANCO)
// ═══════════════════════════════════════════════════════════════════
var _tm = null;
var _ctx = null;

function buildTrustAll() {
    if (_tm) return;
    var X509TM = Java.use("javax.net.ssl.X509TrustManager");
    var SSLCtx  = Java.use("javax.net.ssl.SSLContext");
    var TA = Java.registerClass({
        name: "noxdroid.v5.TrustAll",
        implements: [X509TM],
        methods: {
            checkClientTrusted: function(){},
            checkServerTrusted: function(){},
            getAcceptedIssuers: function(){ return []; },
        }
    });
    _tm = TA.$new();
    _ctx = SSLCtx.getInstance("TLS");
    _ctx.init(null, [_tm], null);
    ok("SSL", "TrustAll criado");
}

function hookSSL() {
    section("SSL pinning bypass", "⬡");

    sh("SSL", "TrustAll global", function () { buildTrustAll(); });

    sh("SSL", "SSLContext.getDefault", function () {
        Java.use("javax.net.ssl.SSLContext").getDefault.implementation = function(){ return _ctx; };
        ok("SSL", "SSLContext.getDefault → TrustAll");
    });

    sh("SSL", "HttpsURLConnection", function () {
        var AH = Java.registerClass({
            name:"noxdroid.v5.AllHosts",
            implements:[Java.use("javax.net.ssl.HostnameVerifier")],
            methods:{verify:function(){return true;}}
        });
        var H = Java.use("javax.net.ssl.HttpsURLConnection");
        H.setDefaultSSLSocketFactory(_ctx.getSocketFactory());
        H.setDefaultHostnameVerifier(AH.$new());
        ok("SSL", "HttpsURLConnection defaults");
    });

    sh("SSL", "TrustManagerImpl", function () {
        try {
            var TMI = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TMI.checkServerTrusted.overload("[Ljava.security.cert.X509Certificate;","java.lang.String")
                .implementation = function(c,a){ return Java.use("java.util.Arrays").asList(c); };
            TMI.checkServerTrusted.overload("[Ljava.security.cert.X509Certificate;","java.lang.String","java.lang.String")
                .implementation = function(c,a,h){ return Java.use("java.util.Arrays").asList(c); };
            ok("SSL", "TrustManagerImpl");
        } catch(e) { skip("SSL", "TrustManagerImpl", e.message); }
    });
}

// ═══════════════════════════════════════════════════════════════════
//  ANTI-FRIDA DETECTION
// ═══════════════════════════════════════════════════════════════════
function hookFridaDetection() {
    section("Frida detection bypass", "⬡");

    sh("FRIDA", "ServerSocket ports", function() {
        var ServerSocket = Java.use("java.net.ServerSocket");
        ServerSocket.$init.overload("int").implementation = function(port) {
            if (port === 27042 || port === 27043 || port === 27044) {
                ok("FRIDA", "Porta " + port + " bloqueada");
                throw Java.use("java.io.IOException").$new("Port already in use");
            }
            return this.$init.call(this, port);
        };
        ok("FRIDA", "Portas Frida bloqueadas");
    });

    sh("FRIDA", "/proc/self/maps scanner", function() {
        var File = Java.use("java.io.File");
        var originalExists = File.exists;
        File.exists.implementation = function() {
            var path = this.getPath();
            if (path.indexOf("frida") !== -1 || path.indexOf("gum-js") !== -1 ||
                path.indexOf("linjector") !== -1 || path.indexOf("frida-agent") !== -1) {
                return false;
            }
            return originalExists.call(this);
        };
        ok("FRIDA", "File.exists frida blocked");
    });

    sh("FRIDA", "Thread enumeration", function() {
        var Thread = Java.use("java.lang.Thread");
        var originalGetAllStackTraces = Thread.getAllStackTraces;
        Thread.getAllStackTraces.implementation = function() {
            var traces = originalGetAllStackTraces.call(this);
            var iterator = traces.keySet().iterator();
            while (iterator.hasNext()) {
                var thread = iterator.next();
                var name = thread.getName();
                if (name && (name.indexOf("frida") !== -1 || name.indexOf("gum-js") !== -1 ||
                             name.indexOf("gmain") !== -1)) {
                    iterator.remove();
                }
            }
            return traces;
        };
        ok("FRIDA", "Thread enumeration bypassed");
    });

    sh("FRIDA", "Socket connection", function() {
        var Socket = Java.use("java.net.Socket");
        Socket.connect.overload("java.net.SocketAddress", "int").implementation = function(endpoint, timeout) {
            var addr = endpoint.toString();
            if (addr.indexOf("27042") !== -1 || addr.indexOf("27043") !== -1) {
                throw Java.use("java.net.ConnectException").$new("Connection refused");
            }
            return this.connect.call(this, endpoint, timeout);
        };
        ok("FRIDA", "Socket connections blocked");
    });

    sh("FRIDA", "Debugger detection", function() {
        var Debug = Java.use("android.os.Debug");
        Debug.isDebuggerConnected.implementation = function() { return false; };
        ok("FRIDA", "Debugger detection bypassed");
    });
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookScreen() {
    section("Screen bypass", "⬡");
    var FS=0x2000;

    sh("SCREEN","Window.setFlags",function(){
        var Win=Java.use("android.view.Window");
        Win.setFlags.implementation=function(f,m){if(f&FS){ok("SCREEN","FLAG_SECURE removido");f&=~FS;}return this.setFlags(f,m);};
        Win.addFlags.implementation=function(f){if(f&FS){f&=~FS;}return this.addFlags(f);};
        ok("SCREEN","FLAG_SECURE bypass");
    });
}

// ═══════════════════════════════════════════════════════════════════
//  NATIVE BYPASS
// ═══════════════════════════════════════════════════════════════════
function hookNative() {
    section("Native bypass", "⬡");
    
    setTimeout(function() {
        var blocked = ["frida", "gum-js", "linjector", "magisk", "ksu"];
        var syms = ["open", "access", "stat", "fopen"];
        
        for (var i = 0; i < syms.length; i++) {
            try {
                var ptr = Module.findExportByName("libc.so", syms[i]);
                if (ptr) {
                    Interceptor.attach(ptr, {
                        onEnter: function(args) {
                            try {
                                var path = args[0].readUtf8String();
                                if (path) {
                                    for (var j = 0; j < blocked.length; j++) {
                                        if (path.indexOf(blocked[j]) !== -1) {
                                            console.log("  NAT    ✔  " + syms[i] + " blocked: " + path);
                                            args[0] = Memory.allocUtf8String("/dev/null");
                                            break;
                                        }
                                    }
                                }
                            } catch(e) {}
                        }
                    });
                    console.log("  NAT    ✔  libc." + syms[i] + " hooked");
                }
            } catch(e) {}
        }
    }, 100);
}

// ═══════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════
var _t0 = Date.now();

Java.perform(function () {
    banner();
    
    if (CONFIG.NATIVE_BYPASS) hookNative();
    if (CONFIG.FRIDA_BYPASS) hookFridaDetection();
    if (CONFIG.ROOT_BYPASS) hookRoot();
    if (CONFIG.ADB_BYPASS) hookAdb();
    if (CONFIG.EMULATOR_BYPASS) hookEmulator();
    if (CONFIG.KEYSTORE_BYPASS) hookKeystore();
    if (CONFIG.SSL_PINNING_BYPASS) hookSSL();
    if (CONFIG.SCREEN_BYPASS) hookScreen();
    
    summary(Date.now() - _t0);
    
    console.log("\n " + C.bg + "⚠" + C.rst + "  " + C.bold + C.y + "Aguardando interação" + C.rst);
    console.log(" " + C.bg + "⚠" + C.rst + "  " + C.dim + "Se crashar, tente: frida -U -f br.com.meupag -l noxdroid_priv.js" + C.rst);
    console.log("");
});