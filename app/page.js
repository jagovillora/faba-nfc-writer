import StoryList from '../components/StoryList';
import storiesData from '../public/stories.json';

export default function Home() {
  return <StoryList stories={storiesData} />;
}
