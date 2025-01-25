-- ----------------------------
-- Table structure for Authorities
-- ----------------------------
DROP TABLE IF EXISTS `Authorities`;
CREATE TABLE `Authorities` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of Authorities
-- ----------------------------
BEGIN;
INSERT INTO `Authorities` VALUES (1, 'admin_login', '登录后台');
INSERT INTO `Authorities` VALUES (5, 'create_account', '创建账号');
INSERT INTO `Authorities` VALUES (10, 'modify_auth', '修改权限、角色配置');
INSERT INTO `Authorities` VALUES (15, 'modify_account', '修改用户信息');
INSERT INTO `Authorities` VALUES (1000, 'login_biz', '登录商户应用');
INSERT INTO `Authorities` VALUES (2000, 'login_client', '登录用户应用');
COMMIT;

-- ----------------------------
-- Table structure for Roles
-- ----------------------------
DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of Roles
-- ----------------------------
BEGIN;
INSERT INTO `Roles` VALUES (1, 'super_admin', '超级管理员');
INSERT INTO `Roles` VALUES (2, 'admin', '管理员');
COMMIT;

-- ----------------------------
-- Table structure for RoleAuthorities
-- ----------------------------
DROP TABLE IF EXISTS `RoleAuthorities`;
CREATE TABLE `RoleAuthorities` (
  `rid` int NOT NULL,
  `aid` int NOT NULL,
  PRIMARY KEY (`rid`,`aid`),
  KEY `aid` (`aid`),
  CONSTRAINT `roleauthorities_ibfk_1` FOREIGN KEY (`rid`) REFERENCES `Roles` (`id`),
  CONSTRAINT `roleauthorities_ibfk_2` FOREIGN KEY (`aid`) REFERENCES `Authorities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of RoleAuthorities
-- ----------------------------
BEGIN;
INSERT INTO `RoleAuthorities` VALUES (1, 1);
INSERT INTO `RoleAuthorities` VALUES (2, 1);
INSERT INTO `RoleAuthorities` VALUES (1, 5);
INSERT INTO `RoleAuthorities` VALUES (1, 10);
INSERT INTO `RoleAuthorities` VALUES (1, 15);
INSERT INTO `RoleAuthorities` VALUES (1, 1000);
INSERT INTO `RoleAuthorities` VALUES (2, 1000);
INSERT INTO `RoleAuthorities` VALUES (1, 2000);
INSERT INTO `RoleAuthorities` VALUES (2, 2000);
COMMIT;

-- ----------------------------
-- Table structure for Users
-- ----------------------------
DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '比较用户名时忽略大小写',
  `password` varchar(255) NOT NULL,
  `rid` int NOT NULL,
  `cid` int DEFAULT NULL COMMENT '创建人id',
  `deletedAt` DATETIME DEFAULT NULL,
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL COMMENT 'image id',
  PRIMARY KEY (`id`),
  KEY `rid` (`rid`),
  KEY `cid` (`cid`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`rid`) REFERENCES `Roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`cid`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of Users
-- ----------------------------
BEGIN;
INSERT INTO `Users` VALUES (1, 'SuperAdmin', 'c8cf9f492a347f3078b23962d14b8c05', 1, NULL, NULL, 1654383101000, 1679767386282,  NULL);
COMMIT;

-- ----------------------------
-- Table structure for UserAuthorities
-- ----------------------------
DROP TABLE IF EXISTS `UserAuthorities`;
CREATE TABLE `UserAuthorities` (
  `uid` int NOT NULL,
  `aid` int NOT NULL,
  PRIMARY KEY (`uid`,`aid`),
  KEY `aid` (`aid`),
  CONSTRAINT `userauthorities_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `Users` (`id`),
  CONSTRAINT `userauthorities_ibfk_2` FOREIGN KEY (`aid`) REFERENCES `Authorities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of UserAuthorities
-- ----------------------------
BEGIN;
INSERT INTO `UserAuthorities` VALUES (1, 1);
INSERT INTO `UserAuthorities` VALUES (1, 5);
INSERT INTO `UserAuthorities` VALUES (1, 10);
INSERT INTO `UserAuthorities` VALUES (1, 15);
INSERT INTO `UserAuthorities` VALUES (1, 1000);
INSERT INTO `UserAuthorities` VALUES (1, 2000);
COMMIT;


SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Table structure for BucketFileDir
-- ----------------------------
DROP TABLE IF EXISTS `BucketFileDirs`;
CREATE TABLE `BucketFileDirs` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `bucketName` varchar(255) NOT NULL,
  `bucketRegion` varchar(255) NOT NULL,
  `parentDirId` varchar(255) DEFAULT NULL COMMENT '父级目录id',
  `description` varchar(255) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedAt` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_bucketfiledir_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`),
  CONSTRAINT `user_bucketfiledir_ibfk_2` FOREIGN KEY (`updatedBy`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------
-- Table structure for BucketFile
-- ----------------------------
DROP TABLE IF EXISTS `BucketFiles`;
CREATE TABLE `BucketFiles` (
  `id` varchar(255) NOT NULL,
  `bucketName` varchar(255) NOT NULL,
  `bucketRegion` varchar(255) NOT NULL,
  `dirId` varchar(255) DEFAULT NULL COMMENT '目录id',
  `fileName` varchar(255) NOT NULL,
  `fileType` varchar(20) NOT NULL,
  `fileUrl` varchar(255) NOT NULL,
  `size` int DEFAULT NULL,
  `cacheControl` int DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedAt` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_bucketfile_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`),
  CONSTRAINT `user_bucketfile_ibfk_2` FOREIGN KEY (`updatedBy`) REFERENCES `Users` (`id`),
  CONSTRAINT `user_bucketfile_ibfk_3` FOREIGN KEY (`dirId`) REFERENCES `BucketFileDirs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  -- CONSTRAINT `user_bucketfile_ibfk_3` FOREIGN KEY (`bucketName`, `bucketRegion`, `dirName`) REFERENCES `BucketFileDir` (`bucketName`, `bucketRegion`, `name`)
