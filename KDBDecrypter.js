
function toJavaByteArr(arr) {
    var B = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, arr.length);
    for (var i = 0; i < arr.length; i++) {
        B[i] = new java.lang.Integer(arr[i]).byteValue()
    }
    return B;
}

function arraycopy(srcArr, srcPos, destArr, destPos, length) {
    for (var i = 0; i < length; i++) {
        destArr[destPos + i] = srcArr[srcPos + i]
    }
}

function initArray(size, fill) {
    var arr = new Array(size);
    for (var i = 0; i < size; i++) {
        arr[i] = fill
    }
    return arr;
}

function genSalt(userId, encType) {
    if (userId <= 0) {
        return '\0'.repeat(16)
    }
    //see com.kakao.talk.util.DataBaseResourceCrypto
    var prefixes = ['', '', '12', '24', '18', '30', '36', '12', '48', '7', '35', '40', '17', '23', '29', 'isabel', 'kale', 'sulli', 'van', 'merry', 'kyle', 'james', 'maddux', 'tony', 'hayden', 'paul', 'elijah', 'dorothy', 'sally','bran','extr.ursra']
    var salt = (prefixes[encType] + userId).slice(0, 16)
    salt = salt + '\0'.repeat(16 - salt.length)
    return new java.lang.String(salt).getBytes("UTF-8").slice()
}

function adjust(a, aOff, b) {
    var x = (b[b.length - 1] & 0xff) + (a[aOff + b.length - 1] & 0xff) + 1;
    a[aOff + b.length - 1] = x % 256;
    x = x >> 8;
    for (var i = b.length - 2; i >= 0; i--) {
        x = x + (b[i] & 0xff) + (a[aOff + i] & 0xff);
        a[aOff + i] = x % 256;
        x = x >> 8;
    }
}

function deriveKey(userId, encType) {
    var salt = genSalt(userId, encType)
    var password = [0, 22, 0, 8, 0, 9, 0, 111, 0, 2, 0, 23, 0, 43, 0, 8, 0, 33, 0, 33, 0, 10, 0, 16, 0, 3, 0, 3, 0, 7, 0, 6, 0, 0]
    var iterations = 2;
    var dkeySize = 32;
    var v = 64; //hash block size
    var u = 20; //hash digest size

    var D = initArray(v, 1)
    var S = initArray(v * Math.floor((salt.length + v - 1) / v), 0);
    for (var i in S) {
        S[i] = salt[i % salt.length]
    }
    var P = initArray(v * Math.floor((password.length + v - 1) / v), 0);
    for (var i in P) {
        P[i] = password[i % password.length]
    }
    var I = S.concat(P)
    var B = initArray(v, 0)

    var c = Math.floor((dkeySize + u - 1) / u)
    var dKey = initArray(dkeySize, 0)

    for (var i = 1; i <= c; i++) {
        var hasher = java.security.MessageDigest.getInstance("SHA-1");
        hasher.update(toJavaByteArr(D))
        hasher.update(toJavaByteArr(I))
        var A = hasher.digest()

        for (var j = 1; j < iterations; j++) {
            hasher = java.security.MessageDigest.getInstance("SHA-1");
            hasher.update(A)
            A = hasher.digest()
        }

        for (var j = 0; j != B.length; j++) {
            B[j] = A[j % A.length];
        }

        for (var j = 0; j != I.length / v; j++) {
            adjust(I, j * v, B);
        }

        if (i == c) {
            arraycopy(A, 0, dKey, (i - 1) * u, dKey.length - ((i - 1) * u))
        }
        else {
            arraycopy(A, 0, dKey, (i - 1) * u, A.length);
        }
    }

    return dKey
}

function b64AESDecrypt(key, iv, encrypted) {
    encrypted = android.util.Base64.decode(encrypted, 0);
    iv = new javax.crypto.spec.IvParameterSpec(iv)
    key = new javax.crypto.spec.SecretKeySpec(key, "AES")
    var cipher = new javax.crypto.Cipher.getInstance("AES/CBC/PKCS5PADDING")
    cipher.init(2, key, iv) //2 is DECRYPT MODE
    return cipher.doFinal(encrypted)
}

function decrypt(key, b64CipherText) {
    try {
        var iv = [15, 8, 1, 0, 25, 71, 37, 220, 21, 245, 23, 224, 225, 21, 12, 53];
        var decrypted = b64AESDecrypt(toJavaByteArr(key), toJavaByteArr(iv), b64CipherText)
        return String(new java.lang.String(decrypted, "utf-8"));
    }
    catch (err) {
        return b64CipherText
    }
}

module.exports.deriveKey = deriveKey
module.exports.decrypt = decrypt
