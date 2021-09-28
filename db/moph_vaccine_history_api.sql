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

 Date: 13/09/2021 19:54:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for moph_vaccine_history_api
-- ----------------------------
DROP TABLE IF EXISTS `moph_vaccine_history_api`;
CREATE TABLE `moph_vaccine_history_api`  (
  `moph_vaccine_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `cid` varchar(13) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `vaccine_dose_no` int(11) NULL DEFAULT NULL,
  `vaccine_datetime` datetime(0) NULL DEFAULT NULL,
  `vaccine_name` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `vaccine_manufacturer_id` int(11) NULL DEFAULT NULL,
  `vaccine_lot_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `hospital_code` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `hospital_name` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `visit_guid` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `immunization_datetime` datetime(0) NULL DEFAULT NULL,
  `target_group` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `add_datetime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`moph_vaccine_history_id`) USING BTREE,
  INDEX `ix_cid`(`cid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 448269 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
