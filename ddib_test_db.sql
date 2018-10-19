CREATE DATABASE  IF NOT EXISTS `ddib` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `ddib`;
-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: localhost    Database: ddib
-- ------------------------------------------------------
-- Server version	5.7.23-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `cateid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`cateid`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'한식'),(2,'중식'),(3,'일식'),(4,'양식'),(5,'분식'),(6,'야식'),(7,'신선품'),(8,'카페/디저트');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `cid` varchar(15) NOT NULL COMMENT 'customer phone number',
  `passwd` varchar(20) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `address` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES ('010-1111-2222','password','조경제','서울특별시 성북구 12341234'),('010-1423-2222','Dubak','김석희','서울특별시 마포구 12341234'),('010-2222-3333','mypassword','john','경기도 구로시 12341234'),('010-2323-2222','androidgood','김정아','대구광역시 중구 12341234'),('010-3333-2222','mysqlgood','윤인성','대전광역시 중구 12341234'),('010-4444-2222','hohomypassword','유재석','강원도 태백시 12341234'),('010-5555-4444','12345678','박성훈','서울특별시 광진구 12341234');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq`
--

DROP TABLE IF EXISTS `faq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `faq` (
  `fid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(45) DEFAULT NULL,
  `answer` longtext,
  PRIMARY KEY (`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq`
--

LOCK TABLES `faq` WRITE;
/*!40000 ALTER TABLE `faq` DISABLE KEYS */;
/*!40000 ALTER TABLE `faq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `cid` varchar(15) NOT NULL,
  `sid` varchar(15) NOT NULL,
  PRIMARY KEY (`cid`,`sid`),
  KEY `supplier_id_idx` (`sid`),
  CONSTRAINT `favorites_supplier` FOREIGN KEY (`sid`) REFERENCES `supplier` (`sid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_favorites_customer` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES ('010-1423-2222','010-2323-5643'),('010-3333-2222','010-2323-5643'),('010-1111-2222','010-4456-2222'),('010-1423-2222','010-4456-2222'),('010-1111-2222','010-4563-2222'),('010-5555-4444','010-4563-2222'),('010-1423-2222','010-6767-4444'),('010-5555-4444','010-6767-4444'),('010-3333-2222','010-8888-3333'),('010-5555-4444','010-8888-3333'),('010-1111-2222','010-9999-2222'),('010-3333-2222','010-9999-2222');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item` (
  `iid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sid` varchar(15) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `cateid` int(11) unsigned DEFAULT NULL,
  `rawprice` int(11) unsigned DEFAULT NULL,
  `saleprice` int(11) unsigned DEFAULT NULL,
  `context` longtext,
  `image` varchar(20) DEFAULT NULL,
  `views` int(11) unsigned DEFAULT '0',
  `starttime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  `deliverable` tinyint(1) DEFAULT NULL COMMENT '배달 가능 불가능',
  PRIMARY KEY (`iid`),
  KEY `sid_idx` (`sid`),
  KEY `cateid_idx` (`cateid`),
  CONSTRAINT `item_category` FOREIGN KEY (`cateid`) REFERENCES `category` (`cateid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `item_supplier` FOREIGN KEY (`sid`) REFERENCES `supplier` (`sid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,'010-9999-2222','순대국',1,6000,4000,'할머니가 만드는 엄청 맛있는 순대국','순대국.jpg',0,'2018-10-04 18:00:00','2018-10-04 20:00:00',0),(2,'010-9999-2222','얼큰버섯순대국',1,7000,4500,'얼큰한 버섯 순대국','얼큰버섯순대국.jpg',0,'2018-10-04 18:00:00','2018-10-04 20:00:00',0),(3,'010-9999-2222','영양순대국',1,7000,4500,'영양 순대국','영양순대국.jpg',0,'2018-10-04 18:00:00','2018-10-04 20:00:00',0),(4,'010-8888-3333','설농탕',1,7000,4500,'맛있는 설농탕','설농탕.jpg',0,'2018-10-04 18:00:00','2018-10-04 20:00:00',1);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `oid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `iid` bigint(20) unsigned DEFAULT NULL,
  `amount` int(11) unsigned DEFAULT NULL,
  `orderstate` varchar(15) DEFAULT NULL,
  `time` int(11) DEFAULT NULL COMMENT '소요 시간',
  `gid` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`oid`),
  KEY `iid_idx` (`iid`),
  KEY `fk_order_1_idx` (`gid`),
  CONSTRAINT `fk_order_1` FOREIGN KEY (`gid`) REFERENCES `order_group` (`gid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `order_item` FOREIGN KEY (`iid`) REFERENCES `item` (`iid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_group`
--

DROP TABLE IF EXISTS `order_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_group` (
  `gid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(15) DEFAULT NULL,
  `orderdate` datetime DEFAULT NULL,
  `payment` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`gid`),
  KEY `fk_order_group_1_idx` (`cid`),
  CONSTRAINT `fk_order_group_1` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_group`
--

LOCK TABLES `order_group` WRITE;
/*!40000 ALTER TABLE `order_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `review` (
  `rid` bigint(20) unsigned NOT NULL,
  `cid` varchar(15) DEFAULT NULL,
  `iid` bigint(20) unsigned DEFAULT NULL,
  `score` int(10) unsigned DEFAULT NULL,
  `text` longtext,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`rid`),
  KEY `itemid_idx` (`iid`),
  KEY `fk_review_customer_idx` (`cid`),
  CONSTRAINT `fk_review_customer` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `review_item` FOREIGN KEY (`iid`) REFERENCES `item` (`iid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_cart`
--

DROP TABLE IF EXISTS `shopping_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shopping_cart` (
  `scid` bigint(20) unsigned NOT NULL,
  `cid` varchar(15) DEFAULT NULL,
  `iid` bigint(20) unsigned DEFAULT NULL,
  `amount` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`scid`),
  KEY `item_id_idx` (`iid`),
  KEY `fk_shopping_cart_customer_idx` (`cid`),
  CONSTRAINT `fk_shopping_cart_customer` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `shopping_cart_item` FOREIGN KEY (`iid`) REFERENCES `item` (`iid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier` (
  `sid` varchar(15) NOT NULL DEFAULT '' COMMENT 'supplier phone number',
  `passwd` varchar(20) DEFAULT NULL,
  `rname` varchar(100) DEFAULT NULL,
  `address` varchar(30) DEFAULT NULL,
  `dlprice` int(11) DEFAULT NULL COMMENT '배달 가능 최소 가',
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES ('010-1423-2536','slslslsls','신선마트','서울특별시 마포구 12341234',9990),('010-2323-5643','ramen','파리바게트','대구광역시 중구 12341234',10000),('010-4456-2222','wow','매운탕먹고싶은날','강원도 태백시 12341234',7000),('010-4563-2222','heyman!','카페24','대전광역시 중구 12341234',9900),('010-6767-4444','whysoserious','돈돈돈돈','서울특별시 광진구 12341234',5000),('010-8888-3333','onboard','신선설농탕','경기도 구로시 12341234',15000),('010-9999-2222','password','할매순댓국','서울특별시 성북구 12341234',12000);
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `want_to_buy`
--

DROP TABLE IF EXISTS `want_to_buy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `want_to_buy` (
  `wid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(15) DEFAULT NULL,
  `cateid` int(11) unsigned DEFAULT NULL,
  `min_price` int(10) unsigned DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `max_price` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`wid`),
  KEY `wtb_category_idx` (`cateid`),
  KEY `fk_want_to_buy_customer_idx` (`cid`),
  CONSTRAINT `fk_want_to_buy_customer` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `wtb_category` FOREIGN KEY (`cateid`) REFERENCES `category` (`cateid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='삽니다!';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `want_to_buy`
--

LOCK TABLES `want_to_buy` WRITE;
/*!40000 ALTER TABLE `want_to_buy` DISABLE KEYS */;
INSERT INTO `want_to_buy` VALUES (1,'010-1111-2222',2,3000,'2018-10-07 02:20:00',15000),(2,'010-1111-2222',1,10000,'2018-10-12 17:33:39',16000);
/*!40000 ALTER TABLE `want_to_buy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlist` (
  `wlid` int(10) unsigned NOT NULL,
  `cid` varchar(15) DEFAULT NULL,
  `iid` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`wlid`),
  KEY `fk_wishlist_1_idx` (`iid`),
  KEY `fk_wishlist_2_idx` (`cid`),
  CONSTRAINT `fk_wishlist_1` FOREIGN KEY (`iid`) REFERENCES `item` (`iid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_wishlist_2` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-19 12:22:34
