/*
 Navicat Premium Data Transfer

 Source Server         : 172.16.9.15
 Source Server Type    : MySQL
 Source Server Version : 50731
 Source Host           : 172.16.9.15:3306
 Source Schema         : hos

 Target Server Type    : MySQL
 Target Server Version : 50731
 File Encoding         : 65001

 Date: 13/09/2021 19:45:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for vaccine_manufacturer
-- ----------------------------
DROP TABLE IF EXISTS `vaccine_manufacturer`;
CREATE TABLE `vaccine_manufacturer`  (
  `vaccine_manufacturer_id` int(11) NOT NULL,
  `vaccine_manufacturer_name` varchar(200) CHARACTER SET tis620 COLLATE tis620_thai_ci NOT NULL,
  PRIMARY KEY (`vaccine_manufacturer_id`) USING BTREE,
  UNIQUE INDEX `ix_vaccine_manufacturer_name`(`vaccine_manufacturer_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = tis620 COLLATE = tis620_thai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vaccine_manufacturer
-- ----------------------------
INSERT INTO `vaccine_manufacturer` VALUES (1, 'AstraZeneca');
INSERT INTO `vaccine_manufacturer` VALUES (3, 'Johnson & Johnson');
INSERT INTO `vaccine_manufacturer` VALUES (5, 'Moderna');
INSERT INTO `vaccine_manufacturer` VALUES (2, 'Novavax');
INSERT INTO `vaccine_manufacturer` VALUES (6, 'Pfizer, BioNTech');
INSERT INTO `vaccine_manufacturer` VALUES (4, 'Sanofi, GlaxoSmithKline');
INSERT INTO `vaccine_manufacturer` VALUES (8, 'Sinopharm');
INSERT INTO `vaccine_manufacturer` VALUES (7, 'Sinovac Life Sciences');

SET FOREIGN_KEY_CHECKS = 1;
