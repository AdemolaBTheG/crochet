ALTER TABLE `patterns` ADD `cover_image_key` text NOT NULL DEFAULT '';
UPDATE `patterns`
SET `cover_image_key` = `slug`
WHERE `cover_image_key` = '';
