# rhinoKakaoTalkDBDecrypter
rhinoKakaoTalkDBDecrypter

**Functions**
|function|return|description|
|--|--|--|
|deriveKey(number userId,number encType)  |UnsignedByte[] key  |generate AES key for KakaoTalkDB from userId and encType. Using cache for key is highly recommended.
|decrypt(UnsignedByte[] key, String encrypted) | String decrypted | decrypt encrypted text by using key from deriveKey()

**userId for data**
|table|  userId|
|--|--|
|chat_logs  |COLUMM 'user_id' of each row |
|friends| COLUMM 'user_id' of TABLE 'open_profile'

