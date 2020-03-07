# rhinoKakaoTalkDBDecrypter
rhinoKakaoTalkDBDecrypter

## Functions

function | return | description
--- | --- | ---
deriveKey(Number userId,Number encType)| UnsignedByte[] key | generate AES key for KakaoTalkDB from userId and encType.
decrypt(UnsignedByte[] key, String encrypted) | String decrypted | decrypt encrypted text by using key from deriveKey()

## userId,encType for data

table|  userId | encType
---|---|---
chat_logs  |COLUMM 'user_id' of each row  | see COLUMM 'v'  of each row
friends| COLUMM 'user_id' of TABLE 'open_profile' or (SELECT id FROM friendes WHERE _id = 2) | COLUMM 'enc' of each row

## KDBManger
sample usage example. you can use this module for get decrypted chat info or friend info
