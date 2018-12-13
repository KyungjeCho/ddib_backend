var key_word = `
select M.*, O.name as category_name from (select L.* from (select K.cid, K.\`name\`, K.fcm_token, K.cateid, cnt from
(select *, count(*) as cnt from (
SELECT 
    C.cid, C.\`name\`, C.fcm_token, D.cateid
FROM
    (SELECT 
        A.*, B.iid
    FROM
        customer A
    INNER JOIN wishlist B ON A.cid = B.cid) C
        INNER JOIN
    item D ON C.iid = D.iid
GROUP BY cid, cateid
UNION ALL
SELECT 
    I.cid, I.name, I.fcm_token, J.cateid
FROM
    (SELECT 
        G.cid, G.name, G.fcm_token, H.iid
    FROM
        (SELECT 
        E.cid, E.\`name\`, E.fcm_token, F.gid
    FROM
        customer E
    INNER JOIN order_group F ON E.cid = F.cid) G
    INNER JOIN \`order\` H ON G.gid = H.gid) I
        INNER JOIN
    item J ON I.iid = J.iid) H WHERE cateid != 7 GROUP BY cid, name, fcm_token, cateid) K order by cid, cnt desc ) L, 
    (select K.cid, K.\`name\`, K.fcm_token, K.cateid, max(cnt) as max_cnt from
(select *, count(*) as cnt from (
SELECT 
    C.cid, C.\`name\`, C.fcm_token, D.cateid
FROM
    (SELECT 
        A.*, B.iid
    FROM
        customer A
    INNER JOIN wishlist B ON A.cid = B.cid) C
        INNER JOIN
    item D ON C.iid = D.iid
GROUP BY cid, cateid
UNION ALL
SELECT 
    I.cid, I.name, I.fcm_token, J.cateid
FROM
    (SELECT 
        G.cid, G.name, G.fcm_token, H.iid
    FROM
        (SELECT 
        E.cid, E.\`name\`, E.fcm_token, F.gid
    FROM
        customer E
    INNER JOIN order_group F ON E.cid = F.cid) G
    INNER JOIN \`order\` H ON G.gid = H.gid) I
        INNER JOIN
    item J ON I.iid = J.iid) H WHERE cateid != 7 GROUP BY cid, name, fcm_token, cateid) K group by cid ) N WHERE L.cid = N.cid AND L.cnt = N.max_cnt AND L.fcm_token is not null) M inner join category O on M.cateid = O.cateid;`

    module.exports = key_word;