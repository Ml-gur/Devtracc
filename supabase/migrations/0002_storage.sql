-- Create a bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Policies for profile pictures bucket
CREATE POLICY "Users can upload their own profile picture" ON storage.objects FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Users can view their own profile picture" ON storage.objects FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Users can update their own profile picture" ON storage.objects FOR UPDATE USING (auth.uid() = owner);
CREATE POLICY "Users can delete their own profile picture" ON storage.objects FOR DELETE USING (auth.uid() = owner);
