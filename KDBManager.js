//DBresponder
var KakaoDecrypter = require("KDBDecrypter.js")
var Utils = require("Utils.js")

function readInputStream(is) {
    var br = new java.io.BufferedReader(new java.io.InputStreamReader(is));
    var readStr = "";
    var str = null;
    while (((str = br.readLine()) != null)) {
        readStr += str + "\n";
    }
    br.close();
    return readStr.trim();
}

function cmd(dir) {
    var p = java.lang.Runtime.getRuntime().exec("su -c \"\"" + dir + "\"\"");
    p.waitFor();
    var r = p.getInputStream() || p.getErrorStream();
    return readInputStream(r);
}

var myIdCache = {}
var keyCache = {}

/*grant Permisson*/
cmd("chmod -R 777 /data/data/com.kakao.talk/databases")
var DB1 = android.database.sqlite.SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk.db", null, 1)
var DB2 = android.database.sqlite.SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk2.db", null, 1)

/*initialize*/
var cur = DB2.rawQuery("SELECT user_id FROM open_profile", null)
cur.moveToNext()
var myid = cur.getString(0)
var sss = ""
for (var i = 20; i <= 27; i++) {
    myIdCache[String(i)] = KakaoDecrypter.deriveKey(myid, i)
    sss += "cache " + i + " is " + myIdCache[i] + "\n"
}
//Api.replyRoom("DEBUG_ROOM", sss)
/***/

function getChatInfo(_id) {

    var collums = [
        "_id",                  //auto increment KEY
        "id",                   //??
        "type",                 //0:room enter/leave, 1:message, 2:photo, 3:video, 5,voice, 6,emoticon(gif), 12:emoticon(png), 14:vote?, 16:location, 17:profile, 18:long text,20:emoticon(webp), 22:emoticon?, 23:#search, 24:notice?, 25:emotice(webp)?, 26:reply, 27:photo group,  71:??, 98:notice, 16385 - ??
        "chat_id",              //??
        "user_id",              //userId
        "message",              //encryptedMessage
        "attachment",           //information about special message(not type 1)
        "created_at",           //created time
        "deleted_at",           //deleted time, 0 means not deleted
        "client_message_id",    //??
        "prev_id",              //??
        "referer",              //??
        "supplement",           //?
        "v"                     //some information about message. below is property of v.
        //v.c : create time (MM-DD HH:mm:ss)
        //v.defaultEmoticonsCount : ??
        //v.enc : *** encrypted type ***
        //v.isMine : if mine, true
        //v.isSingleDefaultEmoticon : ??
        //v.notDecoded : ??
        //v.origin : if mine, "WRITE". if not, "MSG". if someone Enter the room, "NEWMEM". if someone Leave the room, "DELMEM"
    ]

    var cur = DB1.rawQuery("SELECT * FROM chat_logs WHERE _id = ?", [_id])
    cur.moveToNext()

    var ret = {}

    for (var idx in collums) {
        ret[collums[idx]] = cur.getString(idx)
    }
    ret.v = JSON.parse(ret.v)


    /*decrypt key caching*/
    var keyCacheKey = ret.user_id + ret.v.enc
    if (keyCache[keyCacheKey] == undefined) {
        var key = KakaoDecrypter.deriveKey(ret.user_id, ret.v.enc)
        keyCache[keyCacheKey] = key
    }
    else {
        var key = keyCache[keyCacheKey]
    }

    /*decrypt*/
    ret.message = KakaoDecrypter.decrypt(key, ret.message)
    ret.attachment = KakaoDecrypter.decrypt(key, ret.attachment)


    return ret

}

function getUserInfo(userId) {
    var collums = [
        "_id",                          //auto increment KEY
        "contact_id",                   //
        "id",                           //***user id***
        "type",                         //
        "uuid",                         //*encrypted* kakao id
        "phone_number",                 //
        "raw_phone_number",             //
        "name",                         //*encrypted* current name
        "phonetic_name",                //
        "profle_image_url",             //*encrypted* 
        "full_profile_image_url",       //*encrypted* 
        "original_profile_image_url",   //*encrypted* original size profile image url
        "status_message",               //*encrypted*
        "chat_id",                      //
        "brand_new",                    //
        "blocked",                      //
        "favorite",                     //
        "position",                     //
        "v",                            //*encrypted* 
        "board_v",                      //*encrypted*
        "ext",                          //
        "nick_name",                    //
        "user_type",                    //
        "story_user_id",                //
        "accout_id",                    //
        "linked_services",              //
        "hidden",                       //
        "purged",                       //
        "suspended",                    //
        "member_type",                  //
        "involved_chat_ids",            //
        "contact_name",                 //
        "enc",                          //*** encrypted type ***
        "created_at",                   //
        "new_badge_updated_at",         //
        "new_badge_seen_at",            //
        "status_action_token"           //
    ]

    var cur = DB2.rawQuery("SELECT * FROM friends WHERE id = ?", [userId])
    cur.moveToNext()

    var ret = {}

    for (var idx in collums) {
        ret[collums[idx]] = cur.getString(idx)
    }

    /*decrypt*/
    ret.name = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.name)
    ret.uuid = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.uuid)
    ret.profle_image_url = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.profle_image_url)
    ret.full_profile_image_url = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.full_profile_image_url)
    ret.original_profile_image_url = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.original_profile_image_url)
    ret.v = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.v)
    ret.board_v = KakaoDecrypter.decrypt(myIdCache[ret.enc], ret.board_v)

    return ret

}

module.exports.getChatInfo = getChatInfo;
module.exports.getUserInfo = getUserInfo;   
