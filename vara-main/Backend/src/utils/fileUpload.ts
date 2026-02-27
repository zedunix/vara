import { supabaseAdmin } from '../config/supabase';

export const uploadToSupabase = async (
  file: Express.Multer.File,
  bucket: string,
  folder: string
): Promise<string> => {
  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error(`❌ Upload error:`, error);
      throw new Error(`File upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err: any) {
    console.error(`❌ === FILE UPLOAD FAILED ===`);
    console.error(`Error message: ${err.message}`);
    console.error(`Full error:`, err);
    throw err;
  }
};

export const deleteFromSupabase = async (
  bucket: string,
  filePath: string
): Promise<void> => {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};
